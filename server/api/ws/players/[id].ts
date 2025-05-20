import { PLAYER_JOINED_MESSAGE } from '~/utils';
import { getSessionCreatedById } from '../../../utils/websockets';

function getTopicFromUrl(url: string): string {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
}

export default defineWebSocketHandler({
    open(peer) {
        const topic = getTopicFromUrl(peer.request.url);

        peer.subscribe(topic);
    },
    async message(peer, message) {
        const topic = getTopicFromUrl(peer.request.url);

        const messageText = message.text();

        if (messageText === PLAYER_JOINED_MESSAGE) {
            peer.publish(topic, messageText);
            return;
        }

        const messageData = JSON.parse(messageText);

        const sessionCreatedById = await getSessionCreatedById(topic);

        if (sessionCreatedById && !(messageData!.user_id && messageData!.user_id === sessionCreatedById)) {
            // noinspection ExceptionCaughtLocallyJS
            throw createError({
                data: { topic },
            });
        }

        delete messageData.user_id;

        peer.publish(topic, messageText);
    },
    close(peer) {
        const topic = getTopicFromUrl(peer.request.url);

        peer.unsubscribe(topic);
    },
});
