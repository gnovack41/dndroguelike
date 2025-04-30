import { completeMapInsertSerializer, getMapDataFromId } from '../../utils/serializers/map-serializers';
import type { Edge, Map, Node } from '../../utils/drizzle';
import { and, eq, notInArray, sql } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    const completeMap = await useSerializer<{
        details: Map,
        nodes: Node[],
        edges: Edge[],
    }>(event, completeMapInsertSerializer);

    const drizzle = useDrizzle();

    await Promise.all([
        drizzle.update(tables.map).set(completeMap.details).where(eq(tables.map.id, Number(id))),
        drizzle.insert(tables.node).values(completeMap.nodes).onConflictDoUpdate({
            target: tables.node.id,
            set: {
                position_x: sql.raw(`excluded.position_x`),
                position_y: sql.raw(`excluded.position_y`),
            },
        }),
        completeMap.edges.length ? drizzle.insert(tables.edge).values(completeMap.edges).onConflictDoNothing({ target: tables.edge.id }) : undefined,
        drizzle.delete(tables.node).where(and(
            eq(tables.node.map_id, Number(id)),
            notInArray(tables.node.id, completeMap.nodes.map(n => n.id))
        )),
    ]);

    return await getMapDataFromId(Number(id));
});
