CREATE TABLE `device_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`license_id` text NOT NULL,
	`requested` integer NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`resolved_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`license_id`) REFERENCES `licenses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `device_requests_license_idx` ON `device_requests` (`license_id`);--> statement-breakpoint
-- Three devices per license instead of two. Licenses an admin raised further keep their number.
UPDATE `licenses` SET `max_devices` = 3 WHERE `max_devices` = 2;
