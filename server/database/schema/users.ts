import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { baseModel } from './utils';
import { relations } from 'drizzle-orm';

export const user = sqliteTable('user', {
    ...baseModel,
    name: text().notNull().unique(),
});

export const userRelations = relations(user, ({ many }) => ({
    maps: many(tables.map)
}));
