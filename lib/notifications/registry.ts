import type { NotificationStrategy } from "./types";
import { TelegramStrategy } from "./telegram";
import { WebhookStrategy } from "./webhook";

class StrategyRegistry {
  private readonly strategies = new Map<string, NotificationStrategy>();

  register(strategy: NotificationStrategy): void {
    this.strategies.set(strategy.type, strategy);
  }

  get(type: string): NotificationStrategy | undefined {
    return this.strategies.get(type);
  }
}

export const registry = new StrategyRegistry();
registry.register(new TelegramStrategy());
registry.register(new WebhookStrategy());
