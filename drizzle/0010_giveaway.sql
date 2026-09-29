CREATE TABLE `giveaway_draws` (
	`week` text PRIMARY KEY NOT NULL,
	`winner_user_id` text,
	`entry_count` integer NOT NULL,
	`eligible_count` integer NOT NULL,
	`license_id` text,
	`drawn_at` integer NOT NULL,
	`notified_at` integer,
	FOREIGN KEY (`winner_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`license_id`) REFERENCES `licenses`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `giveaway_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`week` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `giveaway_entries_week_user_uniq` ON `giveaway_entries` (`week`,`user_id`);--> statement-breakpoint
CREATE INDEX `giveaway_entries_week_idx` ON `giveaway_entries` (`week`);