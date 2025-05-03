export type Node = {
    id: number,
    map_id: number,
    created_at: string,
    modified_at: string,
    icon: string,
    position_x: number,
    position_y: number,
}

export type Edge = {
    id: number,
    source_id: number,
    target_id: number,
}

export type Map = {
    id: number,
    name: string,
    created_at: string,
    modified_at: string,
    created_by_id: number,
    nodes: Node[],
    edges: Edge[],
}
