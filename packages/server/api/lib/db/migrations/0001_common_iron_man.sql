CREATE TABLE "user_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"is_creator" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
DROP TABLE "users" CASCADE;