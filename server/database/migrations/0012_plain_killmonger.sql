CREATE UNIQUE INDEX `user_name_unique` ON `user` (`name`);--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `email`;