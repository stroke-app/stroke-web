ALTER TABLE `backup_runs` ADD `encrypted` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `backup_runs` ADD `key_id` text;--> statement-breakpoint
ALTER TABLE `backup_runs` ADD `wrapped_key` text;