<script lang="ts" setup>
    import { type Edge, type Node, Panel, useVueFlow, VueFlow } from '@vue-flow/core';
    import CustomNode from '~/components/CustomNode.vue';
    import { MiniMap } from '@vue-flow/minimap';
    import { Background } from '@vue-flow/background';
    import { Map, type MapEdge, type MapNode } from '~/utils/services/maps';
    import { type AsyncState, useAsyncState } from '~/utils/services';
    import { v4 } from 'uuid';
    import { Controls } from '@vue-flow/controls';
    import { PeerInfo, PublishedData } from "~/utils";
    import { z } from "zod";

    const route = useRoute();
    const router = useRouter();

    const mapId = route.params.id as string;

    const CUSTOM_ICONS_KEY = 'custom_icons';

    const AUTOSAVE_INTERVAL_MS = 60000;

    const sessionJoined = ref(false);
    const sessionEnded = ref(false);

    const showPlayerJoinedMessage = ref(false);

    let playerJoinedTimeout: NodeJS.Timeout | null = null;
    let playerJoiningSessionTimeOut: NodeJS.Timeout | null = null;

    function triggerPlayerJoinedMessage() {
        if (playerJoinedTimeout) {
            clearTimeout(playerJoinedTimeout);
        }

        showPlayerJoinedMessage.value = true;

        playerJoinedTimeout = setTimeout(() => {
            showPlayerJoinedMessage.value = false;
        }, 1000);
    }

    const currentPlayersInfo = ref<PeerInfo[]>([]);

    const { open, close, send } = useWebSocket(`/api/ws/players/${ mapId }`, {
        onMessage: async (ws, event) => {
            const eventData = PublishedData.parse(JSON.parse(event.data));

            if (eventData.type === MessageType.PLAYER_JOINED) {
                currentPlayersInfo.value = z.array(PeerInfo).parse(eventData.data);

                triggerPlayerJoinedMessage();
            } else if (eventData.type === MessageType.PLAYER_LEFT) {
                currentPlayersInfo.value = z.array(PeerInfo).parse(eventData.data);
            }

            if (isDungeonMaster.value) {
                if (eventData.type === MessageType.PLAYER_JOINED) {
                    saveMap();
                }
            } else if (eventData.type === MessageType.MAP_UPDATE) {
                if (playerJoiningSessionTimeOut) {
                    clearTimeout(playerJoiningSessionTimeOut);
                    playerJoiningSessionTimeOut = null;
                }

                await populateNodesAndEdgesFromMap(Map.parse(eventData.data));

                sessionJoined.value = true;
            } else if (eventData.type === MessageType.SESSION_ENDED) {
                sessionEnded.value = true;
            }
        },
        immediate: false,
    });

    let intervalAutosaveTimeout: NodeJS.Timeout | null = null;

    function intervalAutoSave() {
        intervalAutosaveTimeout = setInterval(() => {
            if (!activeSession.value) return;

            saveMap();
        }, AUTOSAVE_INTERVAL_MS);
    }

    const playerName = ref('');
    const showPlayerNameForm = ref(false);

    function joinSession() {
        open();
        send(JSON.stringify({
            type: MessageType.PLAYER_JOINED,
            data: { name: playerName.value },
        }));

        showPlayerNameForm.value = false;

        if (playerJoiningSessionTimeOut) {
            clearTimeout(playerJoiningSessionTimeOut);
        }

        playerJoiningSessionTimeOut = setTimeout(() => sessionEnded.value = true, 10000);
    }

    onBeforeMount(() => {
        if (isDungeonMaster.value) return;

        if (playerName.value) joinSession();
        else showPlayerNameForm.value = true;
    });

    onBeforeUnmount(() => {
        if (intervalAutosaveTimeout) {
            clearTimeout(intervalAutosaveTimeout);
        }

        close();
    });

    const vueFlow = useVueFlow();

    const nodes = ref<Node[]>([]);
    const edges = ref<Edge[]>([]);

    const isDungeonMaster = ref(true);

    const mapData = localStorage.getItem(mapId);
    let map: Map | null = null;

    if (mapData) {
        map = JSON.parse(mapData) as Map;
        await populateNodesAndEdgesFromMap(map);

        sessionJoined.value = true;
    } else {
        isDungeonMaster.value = false;
    }

    async function populateNodesAndEdgesFromMap(map: Map) {
        edges.value = [];
        nodes.value = map.nodes.map((node: MapNode) => ({
            id: node.id,
            position: {
                x: node.positionX,
                y: node.positionY,
            },
            type: 'custom',
            data: { icon: node.icon, explored: node.explored, isOrigin: node.isOrigin },
        }));

        await nextTick();

        edges.value = map.edges.map((edge: MapEdge) => ({
            id: edge.id ?? `${ edge.sourceId }->${ edge.targetId }`,
            source: edge.sourceId.toString(),
            target: edge.targetId.toString(),
        }));
    }

    function saveMap() {
        const storagePayload = JSON.stringify({
            name: map!.name,
            nodes: nodes.value.map(node => ({
                id: node.id,
                positionX: Math.round(node.position.x),
                positionY: Math.round(node.position.y),
                icon: node.data.icon,
                explored: node.data.explored,
                isOrigin: node.data.isOrigin,
            })),
            edges: edges.value.map(edge => ({
                id: edge.id,
                sourceId: edge.source,
                targetId: edge.target,
            })),
        });

        const exploredNodes = nodes.value.filter(n => n.data.explored);
        const exploredNodeIds = exploredNodes.map(n => n.id);

        const accessibleEdges = edges.value.filter(e => [e.target, e.source].some(id => exploredNodeIds.includes(id)));
        const accessibleNodes = nodes.value.filter(
            n => n.data.explored || accessibleEdges.some(e => [e.target, e.source].includes(n.id)));

        const playerPayload = {
            name: map!.name,
            nodes: accessibleNodes.map(node => ({
                id: node.id,
                positionX: Math.round(node.position.x),
                positionY: Math.round(node.position.y),
                icon: node.data.icon,
                explored: node.data.explored,
                isOrigin: node.data.isOrigin,
            })),
            edges: accessibleEdges.map(edge => ({
                id: edge.id,
                sourceId: edge.source,
                targetId: edge.target,
            })),
        };

        send(JSON.stringify({
            type: MessageType.MAP_UPDATE,
            data: playerPayload,
        }));

        localStorage.setItem(mapId, storagePayload);
    }

    async function addNode(icon: string) {
        if (!isDungeonMaster.value) return;

        const lastAddedNode = nodes.value[nodes.value.length - 1];

        vueFlow.addNodes({
            id: v4(),
            position: {
                x: lastAddedNode ? lastAddedNode.position.x + 100 : 0,
                y: lastAddedNode ? lastAddedNode.position.y : 0,
            },
            data: { icon, explored: nodes.value.length === 0, isOrigin: nodes.value.length === 0 },
            type: 'custom',
        });

        await nextTick();

        if (nodes.value.length === 1) await vueFlow.fitView();

        saveMap();
    }

    vueFlow.onNodeDoubleClick(async event => {
        if (!isDungeonMaster.value) return;

        vueFlow.removeNodes(event.node.id);

        await nextTick();

        saveMap();
    });

    vueFlow.onEdgeDoubleClick(async event => {
        if (!isDungeonMaster.value) return;

        vueFlow.removeEdges(event.edge.id.toString());

        await nextTick();

        saveMap();
    });

    vueFlow.onConnect(async ({ source, target }) => {
        if (!isDungeonMaster.value) return;

        vueFlow.addEdges({
            source: source,
            target: target,
        });

        await nextTick();

        saveMap();
    });

    vueFlow.onNodeDragStop(() => saveMap());

    vueFlow.onSelectionDragStop(() => saveMap());

    const startSessionState = ref<AsyncState<string>>();

    const activeSession = ref(false);

    function startSession() {
        startSessionState.value = useAsyncState<string>(() => $fetch(
            '/api/sessions',
            { method: 'post', body: { map_id: mapId } },
        ).then((res) => {
            open();
            saveMap();

            activeSession.value = true;

            intervalAutoSave();

            return res;
        }));
    }

    function closeSession() {
        close();

        activeSession.value = false;
        currentPlayersInfo.value = [];

        if (intervalAutosaveTimeout) {
            clearTimeout(intervalAutosaveTimeout);
        }
    }

    async function copySessionLink() {
        await window.navigator.clipboard.writeText(window.location.href);
    }

    function setNodeExplored(id: string) {
        const node = nodes.value.find(n => n.id === id);

        if (!node) return;

        node.data.explored = !node.data.explored;

        saveMap();
    }

    const combatIcons = [
        'mdi:sword-cross',
        'mdi:shield',
        'mdi:skull',
        'mdi:axe-battle',
        'mdi:lightning-bolt',
        'mdi:fire',
        'mdi:arrow-right-bold',
        'mdi:bomb',
        'mdi:dagger',
        'mdi:bow-arrow',
    ];

    const shoppingIcons = [
        'mdi:treasure-chest',
        'mdi:coin',
        'mdi:bag-personal',
        'mdi:scale-balance',
        'mdi:store',
        'mdi:cart',
        'mdi:diamond-stone',
        'mdi:scroll',
        'mdi:gold',
        'mdi:cash',
    ];

    const encounterIcons = [
        'mdi:map-marker',
        'mdi:campfire',
        'mdi:door',
        'mdi:key',
        'mdi:eye',
        'mdi:question-mark',
        'mdi:mountain',
        'mdi:tree',
        'mdi:water',
        'mdi:meteor',
    ];

    const iconGroups = [
        { name: 'Combat', icons: combatIcons },
        { name: 'Shopping', icons: shoppingIcons },
        { name: 'Encounters', icons: encounterIcons },
    ];

    const customIcons = ref<string[]>(JSON.parse(localStorage.getItem(CUSTOM_ICONS_KEY) ?? '[]'));

    const newIconName = ref();

    function updateCustomIcons() {
        customIcons.value.push(newIconName.value);

        localStorage.setItem(CUSTOM_ICONS_KEY, JSON.stringify(customIcons.value));
    }
</script>

<template>
    <div v-if="showPlayerNameForm" class="flex justify-center items-center w-full h-full gap-4">
        <form class="flex flex-col !w-96 gap-4" @submit.prevent="joinSession">
            <UFormField label="Enter Your Name:">
                <UInput v-model="playerName" class="w-full" required/>
            </UFormField>
            <UButton label="Join Session" type="submit"/>
        </form>
    </div>
    <div v-else-if="sessionEnded" class="flex justify-center items-center w-full h-full gap-4">
        <div class="flex flex-col items-center gap-4">
            <UIcon name="gg:smile-sad" size="60"/>
            <p>Session Ended</p>
            <UButton icon="gg:home-alt" label="Home" @click="router.push(`/`)"/>
        </div>
    </div>
    <div v-else-if="!sessionJoined" class="flex justify-center items-center w-full h-full gap-4">
        <div class="flex flex-col items-center gap-4">
            <UIcon class="animate-spin" name="gg:spinner" size="60"/>
            <p>Joining Session...</p>
        </div>
    </div>
    <VueFlow
        v-else
        v-model:edges="edges"
        v-model:nodes="nodes"
        :connection-radius="20"
        :elements-selectable="isDungeonMaster"
        :nodes-connectable="isDungeonMaster"
        :nodes-draggable="isDungeonMaster"
        connect-on-click
        fit-view-on-init
        snap-to-grid
    >
        <Background/>
        <Panel position="top-center">
            <UButton label="Back to Maps" @click="router.push(`/maps`)"/>
        </Panel>

        <Panel v-if="isDungeonMaster" class="flex flex-col gap-6 max-h-[90%] w-28 overflow-y-scroll"
               position="top-left">
            <div v-for="group in iconGroups" :key="group.name" class="flex flex-col gap-2">
                <h3 class="font-semibold">{{ group.name }} </h3>

                <div class="grid grid-rows-5 grid-cols-2 gap-4 items-center">
                    <UButton v-for="icon in group.icons" :key="icon" class="aspect-square flex justify-center"
                             color="neutral"
                             @click="addNode(icon)">
                        <UIcon :name="icon" size="30"/>
                    </UButton>
                </div>
            </div>

            <form class="flex flex-col gap-2" @submit.prevent="updateCustomIcons">
                <h3 class="font-semibold">Custom</h3>

                <div class="grid grid-cols-2 gap-4 items-center">
                    <UButton v-for="icon in customIcons" :key="icon" class="aspect-square flex justify-center"
                             color="neutral"
                             @click="addNode(icon)">
                        <UIcon :name="icon" size="30"/>
                    </UButton>
                </div>

                <UFormField label="Iconify Name">
                    <UInput v-model="newIconName" required/>
                </UFormField>

                <UButton label="Add" type="submit"/>
            </form>

        </Panel>

        <Panel class="flex flex-col gap-1 w-40" position="top-right">
            <template v-if="isDungeonMaster">
                <UButton
                    :label="activeSession ? 'Close Session' : 'Start Session'"
                    :loading="startSessionState?.isPending"
                    class="w-full"
                    @click="activeSession ? closeSession() : startSession()"
                />
                <Transition mode="out-in" name="fade">
                    <UAlert
                        v-if="startSessionState?.isRejected"
                        color="error"
                        description="Please try again later"
                        title="An error occurred"
                    />
                    <div v-else-if="startSessionState?.result && activeSession" class="flex flex-col gap-2">
                        <p>Access Code: {{ startSessionState?.result }}</p>
                        <UButton
                            class="w-full"
                            color="neutral"
                            label="Copy Share Link"
                            @click="copySessionLink"
                        />
                    </div>
                </Transition>
            </template>

            <template v-if="currentPlayersInfo.length">
                <p class="font-medium text-center">
                    Players:
                </p>
                <ul class="flex flex-col gap-2">
                    <li
                        v-for="player in currentPlayersInfo"
                        :key="player.id"
                        class="p-1 border rounded-lg text-center bg-black"
                        :class="{ 'order-first': player.name === playerName }"
                    >
                        <p class="font-medium">
                            {{ player.name }}
                            <span v-if="player.name === playerName"> (You)</span>
                        </p>
                    </li>
                </ul>
            </template>

            <Transition mode="out-in" name="fade">
                <p v-if="showPlayerJoinedMessage" class="text-center">New Player Joined!</p>
            </Transition>
        </Panel>

        <MiniMap :node-stroke-width="20" class="rounded-md overflow-clip" mask-color="#202020" pannable zoomable/>

        <Controls class="flex rounded-md overflow-clip" position="bottom-center" :show-interactive="isDungeonMaster"/>

        <template #node-custom="customNodeProps">
            <CustomNode v-bind="customNodeProps" @explored="setNodeExplored($event)"/>
        </template>
    </VueFlow>
</template>

<style scoped>
    @reference 'tailwindcss';

    .vue-flow__minimap {
        @apply bg-gray-600;
    }
</style>
