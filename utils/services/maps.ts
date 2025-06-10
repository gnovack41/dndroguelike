export type MapNode = {
    id: string,
    icon: string,
    positionX: number,
    positionY: number,
    explored: boolean,
    isOrigin: boolean,
}

export type MapEdge = {
    id: string,
    sourceId: number,
    targetId: number,
}

export type Map = {
    name: string,
    nodes: MapNode[],
    edges: MapEdge[],
}
