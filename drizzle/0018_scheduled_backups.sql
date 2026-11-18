CREATE TABLE `backup_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`connection_id` text NOT NULL,
	`label` text NOT NULL,
	`driver` text NOT NULL,
	`cron` text NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`destination` text NOT NULL,
	`s3_bucket` text,
	`s3_endpoint` text,
	`s3_prefix` text,
	`keep` integer DEFAULT 7 NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`run_requested_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `backup_jobs_user_idx` ON `backup_jobs` (`user_id`);--> statement-breakpoint
CREATE TABLE `backup_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`user_id` text NOT NULL,
	`slot` text NOT NULL,
	`status` text NOT NULL,
	`destination` text NOT NULL,
	`object_key` text,
	`upload_id` text,
	`parts` text,
	`bytes` integer DEFAULT 0 NOT NULL,
	`tables` integer DEFAULT 0 NOT NULL,
	`rows` integer DEFAULT 0 NOT NULL,
	`error` text,
	`device_name` text,
	`started_at` integer NOT NULL,
	`finished_at` integer,
	FOREIGN KEY (`job_id`) REFERENCES `backup_jobs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `backup_runs_job_slot_idx` ON `backup_runs` (`job_id`,`slot`);--> statement-breakpoint
CREATE INDEX `backup_runs_user_idx` ON `backup_runs` (`user_id`,`started_at`);