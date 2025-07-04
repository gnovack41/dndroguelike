import { Map } from "~/utils/services/maps";
import type { MapInfo } from "~/utils";
import { MessageData, MessageType, PeerInfo } from "~/utils";

function getTopicFromUrl(url: string): string {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
}

export const mapToPeerId: Record<string, MapInfo> = {};

export default defineWebSocketHandler({
    open(peer) {
        const topic = getTopicFromUrl(peer.request.url);

        peer.subscribe(topic);
    },
    async message(peer, message) {
        const topic = getTopicFromUrl(peer.request.url);

        const messageData: MessageData = MessageData.parse(message.json());

        if (messageData.type === MessageType.MAP_UPDATE) {
            Map.parse(messageData.data);

            if (mapToPeerId[topic]?.ownerPeerId) {
                if (mapToPeerId[topic].ownerPeerId !== peer.id) {
                    throw createError({
                        statusCode: 403,
                        statusMessage: 'Only the creator of the map may update it.',
                    });
                }
            } else {
                mapToPeerId[topic] = {
                    ownerPeerId: peer.id,
                    playerPeers: {},
                }
            }
        } else if (messageData.type === MessageType.PLAYER_JOINED) {
            const peerInfo = PeerInfo.parse(messageData.data);

            if (!mapToPeerId[topic]) {
                mapToPeerId[topic] = {
                    ownerPeerId: null,
                    playerPeers: {
                        [peer.id]: peerInfo,
                    }
                }
            }

            mapToPeerId[topic].playerPeers[peer.id] = peerInfo;

            peer.publish(
                topic,
                JSON.stringify({
                    type: MessageType.PLAYER_JOINED,
                    data: Object.entries(mapToPeerId[topic].playerPeers).map(([_, info]) => info),
                }),
            );

            return;
        }

        peer.publish(topic, JSON.stringify(messageData));
    },
    close(peer) {
        const topic = getTopicFromUrl(peer.request.url);

        peer.unsubscribe(topic);

        if (mapToPeerId[topic]?.ownerPeerId === peer.id) {
            peer.publish(
                topic,
                JSON.stringify({
                    type: MessageType.SESSION_ENDED,
                    data: Object.entries(mapToPeerId[topic].playerPeers).map(([_, info]) => info),
                }),
            );

            delete mapToPeerId[topic];

            return;
        }

        delete mapToPeerId[topic]?.playerPeers[peer.id];

        peer.publish(
            topic,
            JSON.stringify({
                type: MessageType.PLAYER_LEFT,
                data: Object.entries(mapToPeerId[topic].playerPeers).map(([_, info]) => info),
            }),
        );
    },
});
