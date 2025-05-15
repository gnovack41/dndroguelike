CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL,
	`access_code` text(6) NOT NULL,
	`created_by_id` text NOT NULL
);
