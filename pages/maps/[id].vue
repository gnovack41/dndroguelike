<script lang="ts" setup>
    import { type Edge, type Node, Panel, useVueFlow, VueFlow } from '@vue-flow/core';
    import CustomNode from '~/components/CustomNode.vue';
    import { MiniMap } from '@vue-flow/minimap';
    import { Background } from '@vue-flow/background';
    import type { Map } from '../../utils/services/maps';
    import { type AsyncState, useAsyncState } from '../../utils/services';
    import { v4 } from 'uuid';
    import { PLAYER_JOINED_MESSAGE } from '../../utils';

    const route = useRoute();
    const router = useRouter();

    const mapId = route.params.id as string;

    const sessionJoined = ref(false);

    const showPlayerJoinedMessage = ref(false);

    let playerJoinedTimeout: NodeJS.Timeout | null = null;

    function triggerPlayerJoinedMessage() {
        if (playerJoinedTimeout) {
            clearTimeout(playerJoinedTimeout);
        }

        showPlayerJoinedMessage.value = true;

        setTimeout(() => {
            showPlayerJoinedMessage.value = false;
        }, 1000);
    }

    const { open, close, send } = useWebSocket(`/api/ws/players/${ mapId }`, {
        onMessage: (ws, event) => {
            if (event.data === PLAYER_JOINED_MESSAGE) triggerPlayerJoinedMessage();

            if (isDungeonMaster.value) {
                if (event.data === PLAYER_JOINED_MESSAGE) {
                    saveMap();
                }
            } else {
                try {
                    const mapData = JSON.parse(event.data);

                    populateNodesAndEdgesFromMap(mapData);

                    sessionJoined.value = true;
                } catch {
                    console.log(event.data);
                }
            }
        },
    });

    onBeforeMount(() => {
        if (isDungeonMaster.value) return;

        send(PLAYER_JOINED_MESSAGE);
    });


    onBeforeUnmount(() => close());

    const vueFlow = useVueFlow();

    const nodes = ref<Node[]>([]);
    const edges = ref<Edge[]>([]);

    const isDungeonMaster = ref(true);

    const mapData = localStorage.getItem(mapId);
    let map: Map | null = null;

    if (mapData) {
        map = JSON.parse(mapData) as Map;
        populateNodesAndEdgesFromMap(map);

        sessionJoined.value = true;
    } else {
        isDungeonMaster.value = false;
    }

    function populateNodesAndEdgesFromMap(map: Map) {
        nodes.value = map.nodes.map((node: any) => ({
            id: node.id.toString(),
            position: {
                x: node.position_x,
                y: node.position_y,
            },
            type: 'custom',
            data: { icon: node.icon },
        }));

        edges.value = map.edges.map((edge: any) => ({
            id: edge.id ?? `${ edge.source_id }->${ edge.target_id }`,
            source: edge.source_id.toString(),
            target: edge.target_id.toString(),
        }));
    }

    function saveMap() {
        const payload = JSON.stringify({
            name: map!.name,
            nodes: nodes.value.map(node => ({
                id: node.id,
                position_x: Math.round(node.position.x),
                position_y: Math.round(node.position.y),
                icon: node.data.icon,
            })),
            edges: edges.value.map(edge => ({
                id: edge.id,
                source_id: Number(edge.source),
                target_id: Number(edge.target),
            })),
        });

        send(payload);

        localStorage.setItem(mapId, payload);
    }

    async function addNode(icon: string) {
        if (!isDungeonMaster.value) return;

        vueFlow.addNodes({
            id: (Math.floor(Math.random() * 1000)).toString(),
            position: {
                x: Math.round(window.innerWidth / 2),
                y: 200,
            },
            data: { icon },
            type: 'custom',
        });

        await nextTick();

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

    const nodeIcons = [
        'mdi:sword-cross',
        'mdi:treasure-chest',
        'mdi:door',
        'mdi:key',
        'mdi:skull',
        'mdi:fire',
        'mdi:water',
        'mdi:mountain',
        'mdi:tree',
        'mdi:meteor',
        'mdi:ghost',
        'mdi:eye',
        'mdi:map-marker',
        'mdi:campfire',
        'mdi:flask-round-bottom',
        'mdi:lightning-bolt',
        'mdi:pickaxe',
        'mdi:shield',
        'mdi:stairs-up',
        'mdi:stairs-down',
    ];

    const startSessionState = ref<AsyncState<string>>();

    function startSession() {
        let userId = localStorage.getItem('user_id');
        if (!userId) {
            userId = v4();
            localStorage.setItem('user_id', userId);
        }

        startSessionState.value = useAsyncState<string>(() => $fetch(
            '/api/sessions',
            { method: 'post', body: { map_id: mapId, created_by_id: userId } },
        ));
    }
</script>

<template>
    <div v-if="!sessionJoined" class="flex justify-center items-center w-full h-full gap-4">
        <div class="flex flex-col items-center gap-4">
            <UIcon class="animate-spin" name="gg:spinner" size="60"/>
            <p>Joining Session...</p>
        </div>
    </div>
    <VueFlow
        v-else
        v-model:edges="edges"
        v-model:nodes="nodes"
        :nodes-connectable="isDungeonMaster"
        :nodes-draggable="isDungeonMaster"
    >
        <Background/>
        <Panel position="top-center">
            <UButton label="Back to Maps" @click="router.push(`/maps`)"/>
        </Panel>

        <Panel v-if="isDungeonMaster" position="top-left">
            <div class="grid grid-rows-10 grid-cols-2 gap-4 items-center">
                <UButton v-for="icon in nodeIcons" :key="icon" color="neutral" @click="addNode(icon)">
                    <UIcon :name="icon" size="30"/>
                </UButton>
            </div>
        </Panel>

        <Panel class="flex flex-col gap-1" position="top-right">
            <template v-if="isDungeonMaster">
                <UButton :loading="startSessionState?.isPending" label="Start Session" @click="startSession"/>
                <p v-if="startSessionState?.result">Access Code: {{ startSessionState?.result }}</p>
            </template>

            <Transition mode="out-in" name="fade">
                <p v-if="showPlayerJoinedMessage">New Player Joined!</p>
            </Transition>
        </Panel>

        <MiniMap :node-stroke-width="20" mask-color="#202020" pannable zoomable/>

        <template #node-custom="customNodeProps">
            <CustomNode v-bind="customNodeProps"/>
        </template>
    </VueFlow>
</template>

<style scoped>
@reference 'tailwindcss';

.vue-flow__minimap {
    @apply bg-gray-600;
}
</style>
