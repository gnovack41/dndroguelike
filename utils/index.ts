import { z } from "zod";
import { Map } from "~/utils/services/maps";

export function generateRandomString(length: number): string {
    return Math.random().toString(36).substring(2, length + 2);
}

export enum MessageType {
    PLAYER_JOINED = 'player_joined',
    PLAYER_LEFT = 'player_left',
    SESSION_ENDED = 'session_ended',
    MAP_UPDATE = 'map_update',
}

export const PeerInfo = z.object({
    id: z.string().optional(),
    name: z.string(),
});

export type PeerInfo = z.infer<typeof PeerInfo>;

export const MapInfo = z.object({
    ownerPeerId: z.string().nullable(),
    playerPeers: z.record(z.string(), PeerInfo),
});

export type MapInfo = z.infer<typeof MapInfo>;

export const MessageData = z.object({
    type: z.nativeEnum(MessageType),
    data: z.union([Map, PeerInfo]),
})

export type MessageData = z.infer<typeof MessageData>;

export const PublishedData = z.object({
    type: z.nativeEnum(MessageType),
    data: z.union([Map, z.array(PeerInfo)]).nullable(),
});

export type PublishedData = z.infer<typeof PublishedData>;
