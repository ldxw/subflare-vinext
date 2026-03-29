import { CHANNEL_TYPES, type ChannelType } from "@/db/schema";
import type { NotificationChannelDescriptor } from "./types";
import { TelegramStrategy } from "./telegram";
import { getWebhookSummary, validateWebhookConfig } from "./webhook";

function maskMiddle(value: string, left = 2, right = 2): string {
  if (value.length <= left + right) return value;
  return `${value.slice(0, left)}***${value.slice(-right)}`;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

const telegramStrategy = new TelegramStrategy();

const telegramDescriptor: NotificationChannelDescriptor = {
  type: "telegram",
  label: "Telegram",
  namePlaceholder: "我的 Telegram",
  fields: [
    {
      key: "botToken",
      label: "Bot Token",
      placeholder: "123456:ABC...",
      requiredOnCreate: true,
      allowBlankOnEdit: true,
      inputType: "password",
      description: "编辑时留空表示保持原值不变",
    },
    {
      key: "chatId",
      label: "Chat ID",
      placeholder: "-100...",
      requiredOnCreate: true,
      allowBlankOnEdit: true,
      description: "编辑时留空表示保持原值不变",
    },
  ],
  validateConfig(config) {
    return telegramStrategy.validateConfig(config);
  },
  getSummary(config) {
    if (!isNonEmptyString(config.chatId)) {
      return { hasConfig: false, summary: null };
    }

    return {
      hasConfig: true,
      summary: `Chat ID ${maskMiddle(config.chatId.trim())}`,
    };
  },
};

const webhookDescriptor: NotificationChannelDescriptor = {
  type: "webhook",
  label: "Webhook",
  namePlaceholder: "我的 Webhook",
  fields: [
    {
      key: "url",
      label: "Webhook URL",
      placeholder: "https://example.com/webhook",
      requiredOnCreate: true,
      allowBlankOnEdit: true,
      description: "请输入完整 URL. 编辑时留空表示保持原值不变.",
    },
    {
      key: "method",
      label: "请求方法",
      requiredOnCreate: true,
      inputType: "select",
      options: [
        { value: "post", label: "POST" },
        { value: "get", label: "GET" },
        { value: "put", label: "PUT" },
      ],
      description: "默认使用 POST.",
    },
    {
      key: "headers",
      label: "自定义请求头(JSON, 可选)",
      placeholder: '{"Authorization":"Bearer xxx"}',
      allowBlankOnEdit: true,
      description: "请输入 JSON 对象，键和值都必须是非空字符串. 编辑时留空表示保持原值不变.",
    },
  ],
  validateConfig(config) {
    return validateWebhookConfig(config);
  },
  getSummary(config) {
    return getWebhookSummary(config);
  },
};

export const channelDescriptors: Record<ChannelType, NotificationChannelDescriptor> = {
  telegram: telegramDescriptor,
  webhook: webhookDescriptor,
};

export function getChannelDescriptor(type: string): NotificationChannelDescriptor | undefined {
  return channelDescriptors[type as ChannelType];
}

export const channelTypeOptions = CHANNEL_TYPES.map((type) => ({
  value: type,
  label: channelDescriptors[type].label,
}));
