/**
 * 账户设置 API 路由
 *
 * 该模块提供用户账户设置的获取和更新功能，包括：
 * - 时区设置
 * - 通知时间设置（每天哪些小时发送通知）
 *
 * @module api/settings/account
 */

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { userSettings } from "@/db/schema";
import { requireApiAuth } from "@/lib/session";
import { eq } from "drizzle-orm";
import { z } from "zod";

/**
 * 更新设置的验证模式
 *
 * - timezone: 用户所在时区，非空字符串
 * - notifyHours: 通知小时数组，值为 0-23 的整数，至少包含一个值
 */
const updateSchema = z.object({
  timezone: z.string().min(1).optional(),
  notifyHours: z.array(z.number().int().min(0).max(23)).min(1).optional(),
  notifyDeliveryMode: z.enum(["every_slot", "once_per_day"]).optional(),
});

/**
 * GET /api/settings/account
 *
 * 获取当前用户的账户设置
 *
 * @returns {Promise<NextResponse>} 返回包含以下字段的 JSON 响应：
 *   - timezone: 用户时区（默认 "UTC"）
 *   - notifyHours: 通知小时数组（默认 [0]）
 *
 * @throws {Error} 如果用户未认证, 会抛出错误
 *
 * @example
 * // 响应示例
 * { "timezone": "Asia/Shanghai", "notifyHours": [9, 18] }
 */
export async function GET() {
  // 验证用户身份
  const session = await requireApiAuth();
  const db = await getDb();

  // 查询用户的设置记录
  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, session.userId))
    .limit(1);

  // 如果用户没有设置记录，返回默认值
  if (!settings) {
    return NextResponse.json({ timezone: "UTC", notifyHours: [0], notifyDeliveryMode: "every_slot" });
  }

  // 解析通知小时 JSON 字符串
  let notifyHours: number[] = [0];
  try {
    notifyHours = JSON.parse(settings.notifyHoursJson) as number[];
  } catch { /* 解析失败时使用默认值 */ }

  return NextResponse.json({
    timezone: settings.timezone,
    notifyHours,
    notifyDeliveryMode: settings.notifyDeliveryMode,
  });
}

/**
 * PUT /api/settings/account
 *
 * 更新当前用户的账户设置
 *
 * @param {NextRequest} request - 请求对象，包含 JSON 格式的设置数据
 * @returns {Promise<NextResponse>} 返回更新结果：
 *   - 成功: { success: true }
 *   - 验证失败: { error: ZodError } (状态码 400)
 *
 * @throws {Error} 如果用户未认证, 会抛出错误
 *
 * @example
 * // 请求体示例
 * { "timezone": "Asia/Shanghai", "notifyHours": [9, 12, 18] }
 *
 * // 成功响应
 * { "success": true }
 */
export async function PUT(request: NextRequest) {
  // 验证用户身份
  const session = await requireApiAuth();
  const db = await getDb();

  // 解析并验证请求体
  const body = await request.json() as unknown;
  const parsed = updateSchema.safeParse(body);

  // 验证失败时返回错误详情
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // 检查用户是否已有设置记录
  const [existing] = await db
    .select({ id: userSettings.id })
    .from(userSettings)
    .where(eq(userSettings.userId, session.userId))
    .limit(1);

  // 构建更新值对象
  const values: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.timezone) values.timezone = parsed.data.timezone;
  if (parsed.data.notifyHours) values.notifyHoursJson = JSON.stringify(parsed.data.notifyHours);
  if (parsed.data.notifyDeliveryMode) values.notifyDeliveryMode = parsed.data.notifyDeliveryMode;

  // 根据是否存在记录执行更新或插入操作
  if (existing) {
    // 更新现有记录
    await db.update(userSettings).set(values).where(eq(userSettings.userId, session.userId));
  } else {
    // 创建新记录，使用传入值或默认值
    await db.insert(userSettings).values({
      userId: session.userId,
      ...values,
      timezone: parsed.data.timezone ?? "UTC",
      notifyHoursJson: parsed.data.notifyHours ? JSON.stringify(parsed.data.notifyHours) : "[0]",
      notifyDeliveryMode: parsed.data.notifyDeliveryMode ?? "every_slot",
    });
  }

  return NextResponse.json({ success: true });
}
