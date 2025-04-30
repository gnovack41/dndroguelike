import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { baseModel } from './utils';
import { user } from './users';
import { relations } from 'drizzle-orm';
import { node } from './nodes';


export const map = sqliteTable('map', {
    ...baseModel,
    name: text().notNull(),
    created_by_id: integer().references(() => user.id, { onDelete: 'cascade' }).notNull(),
});

export const mapRelations = relations(map, ({ one, many }) => ({
    created_by: one(user, {
        fields: [map.created_by_id],
        references: [user.id],
    }),
    nodes: many(node),
}));
