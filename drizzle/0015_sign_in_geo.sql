CREATE TABLE `sign_ins` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`source` text NOT NULL,
	`ip` text,
	`country` text,
	`continent` text,
	`region` text,
	`region_code` text,
	`city` text,
	`postal_code` text,
	`timezone` text,
	`latitude` real,
	`longitude` real,
	`asn` integer,
	`as_organization` text,
	`colo` text,
	`user_agent` text,
	`device_id` text,
	`app_version` text,
	`os` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sign_ins_user_idx` ON `sign_ins` (`user_id`);--> statement-breakpoint
CREATE INDEX `sign_ins_created_idx` ON `sign_ins` (`created_at`);--> statement-breakpoint
CREATE INDEX `sign_ins_country_idx` ON `sign_ins` (`country`);--> statement-breakpoint
ALTER TABLE `session` ADD `country` text;--> statement-breakpoint
ALTER TABLE `desktop_tokens` ADD `country` text;