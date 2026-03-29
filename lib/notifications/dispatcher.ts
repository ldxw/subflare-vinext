import type { DrizzleD1Database } from "drizzle-orm/d1";
import { and, eq } from "drizzle-orm";
import { notificationChannels, notificationEvents } from "@/db/schema";
import type * as schema from "@/db/schema";
import { registry } from "./registry";

type DB = DrizzleD1Database<typeof schema>;

export async function dispatchNotification(
  db: DB,
  subscriptionId: number,
  message: string,
  triggerDate: Date,
  triggerLocalDateKey: string,
  triggerHour: number,
  offsetDays: number,
  notifyDeliveryMode: "every_slot" | "once_per_day"
): Promise<void> {
  // 获取所有已启用的通知渠道
  const channels = await db
    .select()
    .from(notificationChannels)
    .where(and(eq(notificationChannels.enabled, true)));

  // 并发向所有渠道发送通知
  await Promise.all(
    channels.map(async (channel) => {
      const existing = await db
        .select({ id: notificationEvents.id })
        .from(notificationEvents)
        .where(
          and(
            eq(notificationEvents.subscriptionId, subscriptionId),
            eq(notificationEvents.channelId, channel.id),
            eq(notificationEvents.triggerDate, triggerDate),
            eq(notificationEvents.offsetDays, offsetDays)
          )
        )
        .limit(1);

      if (existing.length > 0) return;

      if (notifyDeliveryMode === "once_per_day") {
        const existingSameDay = await db
          .select({ id: notificationEvents.id })
          .from(notificationEvents)
          .where(
            and(
              eq(notificationEvents.subscriptionId, subscriptionId),
              eq(notificationEvents.triggerLocalDateKey, triggerLocalDateKey),
              eq(notificationEvents.offsetDays, offsetDays)
            )
          )
          .limit(1);

        if (existingSameDay.length > 0) return;
      }

      // 根据渠道类型（如 "telegram"）获取对应的发送策略实现
      const strategy = registry.get(channel.type);
      if (!strategy) return; // 如果找不到对应的策略（可能未实现或被移除），则跳过

      // 解析渠道的配置 JSON
      const config = JSON.parse(channel.config) as Record<string, unknown>;
      
      // 执行具体的发送逻辑 (调用第三方 API 等)
      const result = await strategy.send(message, config);

      // 将发送结果记录到数据库 (成功或失败都会记录，以便追踪和排查问题)
      await db.insert(notificationEvents).values({
        subscriptionId,
        channelId: channel.id,
        triggerDate,
        triggerLocalDateKey,
        triggerHour,
        offsetDays,
        status: result.success ? "sent" : "failed", // 根据发送结果设置状态
        message,
        providerMessageId: result.providerMessageId, // 第三方渠道返回的唯一消息ID (可选)
        error: result.error,                         // 失败时的错误信息
        sentAt: result.success ? new Date() : null,  // 只有成功才记录发送时间
      });
    })
  );
}
