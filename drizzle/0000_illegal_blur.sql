CREATE TABLE `requests` (
	`id` text PRIMARY KEY NOT NULL,
	`business` text NOT NULL,
	`website` text NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
