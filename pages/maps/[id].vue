<script lang="ts" setup>
    import { type Edge, type Node, Panel, useVueFlow, VueFlow } from '@vue-flow/core';
    import CustomNode from '~/components/CustomNode.vue';
    import { MiniMap } from '@vue-flow/minimap';
    import { Background } from '@vue-flow/background';
    import type { Map } from '../../utils/services/maps';
    import { type AsyncState, useAsyncState } from '../../utils/services';
    import { v4 } from 'uuid';
    import { PLAYER_JOINED_MESSAGE, PLAYER_LEFT_MESSAGE } from '../../utils';
    import { Controls } from '@vue-flow/controls';

    const route = useRoute();
    const router = useRouter();

    const mapId = route.params.id as string;

    const CUSTOM_ICONS_KEY = 'custom_icons';

    let userId = localStorage.getItem('user_id');
    if (!userId) {
        userId = v4();
        localStorage.setItem('user_id', userId);
    }

    const sessionJoined = ref(false);
    const sessionEnded = ref(false);

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

    const currentPlayerCount = ref(0);

    const { open, close, send } = useWebSocket(`/api/ws/players/${ mapId }`, {
        onMessage: async (ws, event) => {
            const eventData = JSON.parse(event.data);

            if (eventData.type === PLAYER_JOINED_MESSAGE) {
                currentPlayerCount.value = eventData.player_count;

                triggerPlayerJoinedMessage();
            } else if (eventData.type === PLAYER_LEFT_MESSAGE) {
                currentPlayerCount.value = eventData.player_count - 1;
            }

            if (isDungeonMaster.value) {
                if (eventData.type === PLAYER_JOINED_MESSAGE) {
                    saveMap();
                }
            } else {
                try {
                    await populateNodesAndEdgesFromMap(eventData);

                    sessionJoined.value = true;
                } catch {
                    if (eventData.type === SESSION_ENDED) {
                        sessionEnded.value = true;
                    }

                    console.log(event.data);
                }
            }
        },
        immediate: false,
    });

    onBeforeMount(() => {
        if (isDungeonMaster.value) return;

        open();
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
        await populateNodesAndEdgesFromMap(map);

        sessionJoined.value = true;
    } else {
        isDungeonMaster.value = false;
    }

    async function populateNodesAndEdgesFromMap(map: Map) {
        nodes.value = map.nodes.map((node: any) => ({
            id: node.id.toString(),
            position: {
                x: node.position_x,
                y: node.position_y,
            },
            type: 'custom',
            data: { icon: node.icon, explored: node.explored, isOrigin: node.isOrigin },
        }));

        await nextTick();

        edges.value = map.edges.map((edge: any) => ({
            id: edge.id ?? `${ edge.source_id }->${ edge.target_id }`,
            source: edge.source_id.toString(),
            target: edge.target_id.toString(),
        }));
    }

    function saveMap() {
        const storagePayload = JSON.stringify({
            name: map!.name,
            nodes: nodes.value.map(node => ({
                id: node.id,
                position_x: Math.round(node.position.x),
                position_y: Math.round(node.position.y),
                icon: node.data.icon,
                explored: node.data.explored,
                isOrigin: node.data.isOrigin,
            })),
            edges: edges.value.map(edge => ({
                id: edge.id,
                source_id: edge.source,
                target_id: edge.target,
            })),
        });

        const exploredNodes = nodes.value.filter(n => n.data.explored);
        const exploredNodeIds = exploredNodes.map(n => n.id);

        const accessibleEdges = edges.value.filter(e => [e.target, e.source].some(id => exploredNodeIds.includes(id)));
        const accessibleNodes = nodes.value.filter(
            n => n.data.explored || accessibleEdges.some(e => [e.target, e.source].includes(n.id)));

        const playerPayload = JSON.stringify({
            name: map!.name,
            nodes: accessibleNodes.map(node => ({
                id: node.id,
                position_x: Math.round(node.position.x),
                position_y: Math.round(node.position.y),
                icon: node.data.icon,
                explored: node.data.explored,
                isOrigin: node.data.isOrigin,
            })),
            edges: accessibleEdges.map(edge => ({
                id: edge.id,
                source_id: Number(edge.source),
                target_id: Number(edge.target),
            })),
        });

        send(playerPayload);

        localStorage.setItem(mapId, storagePayload);
    }

    async function addNode(icon: string) {
        if (!isDungeonMaster.value) return;

        vueFlow.addNodes({
            id: (Math.floor(Math.random() * 1000)).toString(),
            position: {
                x: Math.round(window.innerWidth / 2),
                y: 200,
            },
            data: { icon, explored: nodes.value.length === 0, isOrigin: nodes.value.length === 0 },
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

    vueFlow.onSelectionDragStop(() => saveMap());

    const startSessionState = ref<AsyncState<string>>();

    const activeSession = ref(false);

    function startSession() {
        startSessionState.value = useAsyncState<string>(() => $fetch(
            '/api/sessions',
            { method: 'post', body: { map_id: mapId, created_by_id: userId } },
        ).then((res) => {
            open();

            activeSession.value = true;

            return res;
        }));
    }

    function closeSession() {
        close();

        activeSession.value = false;
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
    <div v-if="!sessionJoined" class="flex justify-center items-center w-full h-full gap-4">
        <div class="flex flex-col items-center gap-4">
            <UIcon class="animate-spin" name="gg:spinner" size="60"/>
            <p>Joining Session...</p>
        </div>
    </div>
    <div v-else-if="sessionEnded" class="flex justify-center items-center w-full h-full gap-4">
        <div class="flex flex-col items-center gap-4">
            <UIcon name="gg:smile-sad" size="60"/>
            <p>Session Ended</p>
            <UButton icon="gg:home-alt" label="Home" @click="router.push(`/`)"/>
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
                        <p class="font-medium text-center">
                            Num Players: {{ Math.max(currentPlayerCount - 1, 0) }}
                        </p>
                    </div>
                </Transition>
            </template>


            <Transition mode="out-in" name="fade">
                <p v-if="showPlayerJoinedMessage" class="text-center">New Player Joined!</p>
            </Transition>
        </Panel>

        <MiniMap :node-stroke-width="20" class="rounded-md overflow-clip" mask-color="#202020" pannable zoomable/>

        <Controls class="flex rounded-md overflow-clip" position="bottom-center"/>

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
