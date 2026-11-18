ALTER TABLE `account_trials` ADD `device_id` text;--> statement-breakpoint
CREATE INDEX `account_trials_device_idx` ON `account_trials` (`device_id`);--> statement-breakpoint
-- Trials from before this column: the first computer the account signed in on.
UPDATE `account_trials` SET `device_id` = (
  SELECT `device_id` FROM `desktop_tokens` t
  WHERE t.`user_id` = `account_trials`.`user_id`
  ORDER BY t.`created_at` ASC LIMIT 1
) WHERE `device_id` IS NULL;
