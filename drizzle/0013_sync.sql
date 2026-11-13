CREATE TABLE `sync_keys` (
	`user_id` text PRIMARY KEY NOT NULL,
	`wrapped_key` text NOT NULL,
	`kdf` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sync_records` (
	`user_id` text NOT NULL,
	`id` text NOT NULL,
	`kind` text NOT NULL,
	`version` integer NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`ciphertext` text,
	`updated_at` integer NOT NULL,
	`seq` integer NOT NULL,
	PRIMARY KEY(`user_id`, `id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sync_records_user_seq_idx` ON `sync_records` (`user_id`,`seq`);--> statement-breakpoint
CREATE TABLE `sync_state` (
	`user_id` text PRIMARY KEY NOT NULL,
	`last_seq` integer DEFAULT 0 NOT NULL,
	`total_bytes` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "sync_state_quota" CHECK(total_bytes <= 52428800)
);
