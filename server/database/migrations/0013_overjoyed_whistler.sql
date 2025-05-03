PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_node` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`modified_at` integer NOT NULL,
	`position_x` integer NOT NULL,
	`position_y` integer NOT NULL,
	`icon` text NOT NULL,
	`map_id` integer NOT NULL,
	FOREIGN KEY (`map_id`) REFERENCES `map`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_node`("id", "created_at", "modified_at", "position_x", "position_y", "icon", "map_id") SELECT "id", "created_at", "modified_at", "position_x", "position_y", "icon", "map_id" FROM `node`;--> statement-breakpoint
DROP TABLE `node`;--> statement-breakpoint
ALTER TABLE `__new_node` RENAME TO `node`;--> statement-breakpoint
PRAGMA foreign_keys=ON;