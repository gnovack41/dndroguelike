import {MessageType} from "~/utils";
import type {PublishedData, PeerInfo} from "~/utils";
import {mapToPeerId} from "~/server/api/ws/players/[id]";
import type { Map } from "~/utils/services/maps";

function getPeerDataArray(mapId: string): PeerInfo[] {
    return Object.entries(mapToPeerId[mapId].playerPeers).map(([id, info]) => ({
        id,
        ...info,
    }));
}

export function handleMapUpdateMessage(
    topic: string,
    peerId: string,
    mapData: Map,
): PublishedData {
    if (mapToPeerId[topic]?.ownerPeerId) {
        if (mapToPeerId[topic].ownerPeerId !== peerId) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Only the creator of the map may update it.',
            });
        }
    } else {
        mapToPeerId[topic] = {
            ownerPeerId: peerId,
            playerPeers: {},
        }
    }

    return {
        type: MessageType.MAP_UPDATE,
        data: mapData,
    }
}

export function handlePlayerJoinedMessage(
    topic: string,
    peerId: string,
    peerInfo: PeerInfo,
): PublishedData {
    if (!mapToPeerId[topic]) {
        mapToPeerId[topic] = {
            ownerPeerId: null,
            playerPeers: {
                [peerId]: peerInfo,
            }
        }
    } else {
        mapToPeerId[topic].playerPeers[peerId] = peerInfo;
    }

    return {
        type: MessageType.PLAYER_JOINED,
        data: getPeerDataArray(topic),
    }
}

export function handlePeerLeftEvent(
    topic: string,
    peerId: string,
): PublishedData {
    if (mapToPeerId[topic]?.ownerPeerId === peerId) {
        delete mapToPeerId[topic];

        return {
            type: MessageType.SESSION_ENDED,
            data: null,
        };
    }

    delete mapToPeerId[topic]?.playerPeers[peerId];

    return {
        type: MessageType.PLAYER_LEFT,
        data: getPeerDataArray(topic),
    }
}
