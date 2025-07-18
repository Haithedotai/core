import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user_table', {
  id: serial('id').primaryKey(),
  address: text('address').notNull(),
  isCreator: boolean('is_creator').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertUser = typeof userTable.$inferInsert;
export type SelectUser = typeof userTable.$inferSelect;