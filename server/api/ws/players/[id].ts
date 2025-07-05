import { Map } from "~/utils/services/maps";
import type { MapInfo, PublishedData } from "~/utils";
import { MessageData, MessageType, PeerInfo } from "~/utils";
import { handleMapUpdateMessage, handlePeerLeftEvent, handlePlayerJoinedMessage } from "~/server/utils/websockets";

export const mapToPeerId: Record<string, MapInfo> = {};

function getTopicFromUrl(url: string): string {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
}

const messageTypeToHandler: {
    [MessageType.MAP_UPDATE]: (topic: string, peerId: string, mapData: unknown) => PublishedData;
    [MessageType.PLAYER_JOINED]: (topic: string, peerId: string, peerInfo: unknown) => PublishedData
} = {
    [MessageType.MAP_UPDATE]: (topic: string, peerId: string, mapData: unknown) =>
        handleMapUpdateMessage(topic, peerId, Map.parse(mapData)),
    [MessageType.PLAYER_JOINED]: (topic: string, peerId: string, peerInfo: unknown) =>
        handlePlayerJoinedMessage(topic, peerId, PeerInfo.parse(peerInfo)),
}

export default defineWebSocketHandler({
    open(peer) {
        const topic = getTopicFromUrl(peer.request.url);

        peer.subscribe(topic);
    },
    message(peer, message) {
        const topic = getTopicFromUrl(peer.request.url);

        const messageData: MessageData = MessageData.parse(message.json());

        const publishedData = messageTypeToHandler[messageData.type as keyof typeof messageTypeToHandler](
            topic,
            peer.id,
            messageData.data,
        );

        peer.send(JSON.stringify(publishedData));
        peer.publish(topic, JSON.stringify(publishedData));
    },
    close(peer) {
        const topic = getTopicFromUrl(peer.request.url);

        peer.unsubscribe(topic);

        peer.publish(
            topic,
            JSON.stringify(handlePeerLeftEvent(topic, peer.id)),
        );
    },
});
