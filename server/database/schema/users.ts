import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { baseModel } from './utils';

export const user = sqliteTable('user', {
    ...baseModel,
    name: text().notNull(),
    email: text().notNull(),
});
