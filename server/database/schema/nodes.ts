import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { baseModel } from './utils';
import { map } from './maps';
import { relations } from 'drizzle-orm';
import { edge } from './edges';


export const node = sqliteTable('node', {
    ...baseModel,
    position_x: integer(),
    position_y: integer(),
    type: text({ enum: ['anchor', 'apple', 'anvil'] }),
    map_id: integer().references(() => map.id, { onDelete: 'cascade' }).notNull(),
});

export const nodeRelations = relations(node, ({ one, many }) => ({
    map: one(map, {
        fields: [node.map_id],
        references: [map.id],
    }),
    sourceEdges: many(edge, { relationName: 'source' }),
    targetEdges: many(edge, { relationName: 'target' }),
}));
