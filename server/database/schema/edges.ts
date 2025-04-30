import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { baseModel } from './utils';
import { node } from './nodes';
import { relations } from 'drizzle-orm';


export const edge = sqliteTable('edge', {
    ...baseModel,
    source_id: integer().references(() => node.id, { onDelete: 'cascade' }).notNull(),
    target_id: integer().references(() => node.id, { onDelete: 'cascade' }).notNull(),
});

export const edgeRelations = relations(edge, ({ one }) => ({
    source: one(node, {
        fields: [edge.source_id],
        references: [node.id],
        relationName: 'source,'
    }),
    target: one(node, {
        fields: [edge.target_id],
        references: [node.id],
        relationName: 'target',
    })
}));
