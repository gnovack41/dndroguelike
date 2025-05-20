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

        peer.publish(topic, messageText);
    },
    close(peer) {
        const topic = getTopicFromUrl(peer.request.url);

        peer.unsubscribe(topic);
    },
});
