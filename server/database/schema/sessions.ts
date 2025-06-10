import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { baseModel } from './utils';


export const sessions = sqliteTable('sessions', {
    ...baseModel,
    id: text().notNull().primaryKey(),
    access_code: text({ length: 6 }).notNull().unique(),
});
