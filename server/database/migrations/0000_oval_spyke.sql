CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL
);
