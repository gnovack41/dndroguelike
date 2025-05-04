import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { edge, map, node } from '../../database/schema';
import { baseModelSerializerFields } from '../../database/schema/utils';
import { z } from 'zod';
import type { Edge, Map, Node } from '../drizzle';
import { RuntimeException } from '@poppinss/exception';


export const mapSelectSerializer = createSelectSchema(map);
export const nodeSelectSerializer = createSelectSchema(node);
export const edgeSelectSerializer = createSelectSchema(edge);
export const thinEdgeSelectSerializer = z.object({
    id: edgeSelectSerializer.shape.id,
    source_id: edgeSelectSerializer.shape.source_id,
    target_id: edgeSelectSerializer.shape.target_id,
});

export const mapInsertSerializer = createInsertSchema(map, baseModelSerializerFields);
export const nodeInsertSerializer = createInsertSchema(node, baseModelSerializerFields);
export const edgeInsertSerializer = createInsertSchema(edge, {
    ...baseModelSerializerFields,
    map_id: (schema) => schema.default(-1),
});

export const completeMapSelectSerializer = z.object({
    ...mapSelectSerializer.shape,
    nodes: z.array(nodeSelectSerializer),
    edges: z.array(thinEdgeSelectSerializer),
});

export const completeMapInsertSerializer = z.object({
    details: z.object(mapInsertSerializer.shape),
    nodes: z.array(nodeInsertSerializer),
    edges: z.array(edgeInsertSerializer),
});

export async function getMapDataFromId(id: number): Promise<Map & {
    nodes: Node[],
    edges: Omit<Edge, 'created_at' | 'modified_at' | 'map_id'>[]
}> {
    const drizzle = useDrizzle();

    const map = await drizzle.query.map.findFirst({
        where: (m, { eq }) => eq(m.id, Number(id)),
        with: {
            nodes: true,
            edges: {
                columns: {
                    id: true,
                    source_id: true,
                    target_id: true,
                },
            },
        },
    });

    if (!map) {
        throw new RuntimeException('Map does not exist');
    }

    // const edges = await (
    //     drizzle
    //         .select({
    //             id: edge.id,
    //             source_id: edge.source_id,
    //             target_id: edge.target_id,
    //         })
    //         .from(edge)
    //         .innerJoin(node, eq(edge.target_id, node.id))
    //         .where(eq(node.map_id, Number(id)))
    // );

    return completeMapSelectSerializer.parse(map);
}
