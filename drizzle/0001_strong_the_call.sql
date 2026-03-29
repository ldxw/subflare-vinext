PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_notification_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subscription_id` integer NOT NULL,
	`channel_id` integer NOT NULL,
	`trigger_date` integer NOT NULL,
	`trigger_local_date_key` text NOT NULL,
	`trigger_hour` integer NOT NULL,
	`offset_days` integer NOT NULL,
	`status` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`provider_message_id` text,
	`error` text,
	`sent_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`channel_id`) REFERENCES `notification_channels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_notification_events`("id", "subscription_id", "channel_id", "trigger_date", "trigger_local_date_key", "trigger_hour", "offset_days", "status", "message", "provider_message_id", "error", "sent_at", "created_at") SELECT "id", "subscription_id", "channel_id", "trigger_date", "trigger_local_date_key", "trigger_hour", "offset_days", "status", "message", "provider_message_id", "error", "sent_at", "created_at" FROM `notification_events`;--> statement-breakpoint
DROP TABLE `notification_events`;--> statement-breakpoint
ALTER TABLE `__new_notification_events` RENAME TO `notification_events`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `notification_events_dedup_unique` ON `notification_events` (`subscription_id`,`channel_id`,`trigger_date`,`offset_days`);--> statement-breakpoint
CREATE INDEX `notification_events_status_trigger_idx` ON `notification_events` (`status`,`trigger_date`);--> statement-breakpoint
CREATE INDEX `notification_events_subscription_local_date_idx` ON `notification_events` (`subscription_id`,`trigger_local_date_key`,`offset_days`);--> statement-breakpoint
ALTER TABLE `notification_channels` DROP COLUMN `is_default`;--> statement-breakpoint
ALTER TABLE `notification_channels` DROP COLUMN `last_error`;