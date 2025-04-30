PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_edge` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL,
	`source_id` integer NOT NULL,
	`target_id` integer NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `node`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_id`) REFERENCES `node`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_edge`("id", "created_at", "modified_at", "source_id", "target_id") SELECT "id", "created_at", "modified_at", "source", "target" FROM `edge`;--> statement-breakpoint
DROP TABLE `edge`;--> statement-breakpoint
ALTER TABLE `__new_edge` RENAME TO `edge`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
