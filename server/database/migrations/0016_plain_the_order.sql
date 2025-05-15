DROP TABLE `edge`;--> statement-breakpoint
DROP TABLE `map`;--> statement-breakpoint
DROP TABLE `node`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_access_code_unique` ON `sessions` (`access_code`);