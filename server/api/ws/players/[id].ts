function getTopicFromUrl(url: string): string {
    const urlParts = url.split('/');
    const mapId = Number(urlParts[urlParts.length - 1]);

    return `MAP ${ mapId }`;
}

export default defineWebSocketHandler({
    open(peer) {
        const topic = getTopicFromUrl(peer.request.url);

        peer.subscribe(topic);
    },
    message(peer, message) {
        const topic = getTopicFromUrl(peer.request.url);

        const messageData = message.text();

        peer.publish(topic, messageData);
    },
    close(peer) {
        const topic = getTopicFromUrl(peer.request.url);

        peer.unsubscribe(topic);
    },
});
