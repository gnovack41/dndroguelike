import { PLAYER_JOINED_MESSAGE, PLAYER_LEFT_MESSAGE, SESSION_ENDED } from '~/utils';

function getTopicFromUrl(url: string): string {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
}

const mapToPeerId: Record<string, string> = {};

export default defineWebSocketHandler({
    open(peer) {
        const topic = getTopicFromUrl(peer.request.url);

        peer.subscribe(topic);

        peer.publish(
            topic,
            JSON.stringify({
                type: PLAYER_JOINED_MESSAGE,
                player_count: peer.peers.size,
            }),
        );
    },
    async message(peer, message) {
        const topic = getTopicFromUrl(peer.request.url);

        const messageText = message.text();

        if (mapToPeerId[topic]) {
            if (mapToPeerId[topic] !== peer.id) {
                throw createError({
                    statusCode: 403,
                    statusMessage: 'Only the creator of the map may update it.',
                });
            }
        } else {
            mapToPeerId[topic] = peer.id;
        }

        peer.publish(topic, messageText);
    },
    close(peer) {
        const topic = getTopicFromUrl(peer.request.url);

        peer.unsubscribe(topic);

        if (mapToPeerId[topic] === peer.id) {
            delete mapToPeerId[topic];

            peer.publish(
                topic,
                JSON.stringify({
                    type: SESSION_ENDED,
                    player_count: peer.peers.size,
                }),
            );

            return;
        }

        peer.publish(
            topic,
            JSON.stringify({
                type: PLAYER_LEFT_MESSAGE,
                player_count: peer.peers.size,
            }),
        );
    },
});
