export interface SendResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

export interface NotificationStrategy {
  readonly type: string;
  send(message: string, config: Record<string, unknown>): Promise<SendResult>;
  validateConfig(config: Record<string, unknown>): boolean;
}

export interface NotificationChannelFieldOption {
  value: string;
  label: string;
}

export interface NotificationChannelFieldDefinition {
  key: string;
  label: string;
  placeholder?: string;
  requiredOnCreate?: boolean;
  allowBlankOnEdit?: boolean;
  inputType?: "text" | "password" | "select";
  options?: NotificationChannelFieldOption[];
  description?: string;
}

export interface NotificationChannelDescriptor {
  type: string;
  label: string;
  namePlaceholder: string;
  fields: NotificationChannelFieldDefinition[];
  validateConfig(config: Record<string, unknown>): boolean;
  getSummary(config: Record<string, unknown>): {
    hasConfig: boolean;
    summary: string | null;
  };
}
