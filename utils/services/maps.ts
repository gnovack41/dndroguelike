import { z } from "zod";

export const MapNode = z.object({
    id: z.string(),
    icon: z.string(),
    positionX: z.number(),
    positionY: z.number(),
    explored: z.boolean(),
    isOrigin: z.boolean(),
})

export type MapNode = z.infer<typeof MapNode>;

export const MapEdge = z.object({
    id: z.string(),
    sourceId: z.string(),
    targetId: z.string(),
})

export type MapEdge = z.infer<typeof MapEdge>;

export const ThinMap = z.object({
    id: z.string(),
    name: z.string(),
    created: z.iso.date(),
});

export type ThinMap = z.infer<typeof ThinMap>;

export const Map = z.object({
    ...ThinMap.shape,
    nodes: z.array(MapNode),
    edges: z.array(MapEdge),
})

export type Map = z.infer<typeof Map>;

