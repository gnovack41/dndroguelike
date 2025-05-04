<script lang="ts" setup>
    import { type Edge, type Node, Panel, useVueFlow, VueFlow } from '@vue-flow/core';
    import CustomNode from '~/components/CustomNode.vue';
    import { MiniMap } from '@vue-flow/minimap';
    import { Background } from '@vue-flow/background';
    import { useAsyncState } from '../../utils/services';
    import type { Map } from '../../utils/services/maps';

    const route = useRoute();
    const router = useRouter();

    const mapId = route.params.id;

    const { open, close, send } = useWebSocket(`/api/ws/players/${ mapId }`, {
        onMessage: (ws, event) => {
            try {
                const mapData = JSON.parse(event.data);

                populateNodesAndEdgesFromMap(mapData);
            } catch {
                console.log(event.data);
            }
        },
    });

    onUnmounted(() => close());

    const vueFlow = useVueFlow();

    const nodes = ref<Node[]>([]);
    const edges = ref<Edge[]>([]);

    const isDungeonMaster = ref(false);

    const mapRequest = await useFetch(`/api/maps/${ mapId }`, {
        method: 'get',
    }).then((res) => {
        populateNodesAndEdgesFromMap(res.data.value as Map);

        return res;
    });

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

    const saveMapState = ref();

    function saveMap() {
        const payload = {
            details: {
                name: mapRequest.data.value!.name,
                created_by_id: mapRequest.data.value!.created_by_id,
            },
            nodes: nodes.value.map(node => ({
                id: Number(node.id),
                position_x: Math.round(node.position.x),
                position_y: Math.round(node.position.y),
                icon: node.data.icon,
                map_id: Number(mapId),
            })),
            edges: edges.value.map(edge => ({
                id: isNaN(Number(edge.id)) ? undefined : Number(edge.id),
                source_id: Number(edge.source),
                target_id: Number(edge.target),
            })),
        };

        saveMapState.value = useAsyncState(() =>
            $fetch<Map>(`/api/maps/${ mapId }`, {
                method: 'post',
                body: payload,
            }),
        );

        send(JSON.stringify(payload));
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

    const openSelectRoleModal = ref(true);
</script>

<template>
    <UModal
        v-model:open="openSelectRoleModal"
        :close="false"
        :dismissible="false"
        title="I am a..."
    >
        <template #body>
            <div class="flex gap-4">
                <UButton
                    label="Dungeon Master"
                    size="lg"
                    @click="isDungeonMaster = true; openSelectRoleModal = false;"
                />
                <UButton label="Player" size="lg" @click="openSelectRoleModal = false"/>
            </div>
        </template>
    </UModal>
    <VueFlow
        v-model:edges="edges"
        v-model:nodes="nodes"
        :nodes-connectable="isDungeonMaster"
        :nodes-draggable="isDungeonMaster"
    >
        <Background/>
        <Panel position="top-center">
            <UButton label="Back to Maps" @click="router.push(`/users/${mapRequest.data.value.created_by_id}`)"/>
        </Panel>

        <Panel v-if="isDungeonMaster" position="top-left">
            <div class="grid grid-rows-10 grid-cols-2 gap-4 items-center">
                <UButton v-for="icon in nodeIcons" :key="icon" color="neutral" @click="addNode(icon)">
                    <UIcon :name="icon" size="30"/>
                </UButton>
            </div>
        </Panel>

        <Panel v-if="saveMapState?.isPending" class="flex flex-col gap-1" position="top-right">
            <UIcon class="animate-spin" name="gg:spinner" size="40"/>
            <p class="text-sm">Saving...</p>
        </Panel>

        <MiniMap mask-color="#202020" node-stroke-width="20" pannable zoomable/>

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
