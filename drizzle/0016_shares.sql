CREATE TABLE `shares` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`kind` text NOT NULL,
	`size` integer NOT NULL,
	`expires_at` integer,
	`max_views` integer,
	`views` integer DEFAULT 0 NOT NULL,
	`password_salt` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`last_viewed_at` integer,
	`revoked_at` integer,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `shares_owner_idx` ON `shares` (`owner_id`);--> statement-breakpoint
CREATE INDEX `shares_expires_idx` ON `shares` (`expires_at`);