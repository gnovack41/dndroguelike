import type { Edge, Map, Node } from '../../utils/drizzle';
import { completeMapInsertSerializer, completeMapSelectSerializer } from '../../utils/serializers/map-serializers';
import { map } from '../../database/schema';


export default defineEventHandler(async (event) => {
    const completeMap = await useSerializer<{
        details: Map,
        nodes: Node[],
        edges: Edge[],
    }>(event, completeMapInsertSerializer);

    const newMap = await useDrizzle().insert(map).values(completeMap.details).returning();

    console.log(newMap);

    return completeMapSelectSerializer.parse({ ...newMap[0], nodes: [], edges: [] });
});
