// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const editions = sqliteTable('editions', {date: text('date').primaryKey(), payload: text('payload').notNull(), updatedAt: text('updated_at').notNull()});
