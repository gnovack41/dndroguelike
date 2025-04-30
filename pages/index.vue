<script lang="ts" setup>
    import { type Edge, type Node, Panel, useVueFlow, VueFlow } from '@vue-flow/core';
    import CustomNode from '~/components/CustomNode.vue';
    import { MiniMap } from '@vue-flow/minimap';
    import { Background } from '@vue-flow/background';
    import { useAsyncState } from '../utils/services';
    import type { Map } from '../utils/services/maps';

    const vueFlow = useVueFlow();

    const targetTableId = ref(1);

    const mapRequest = await useFetch(() => `/api/maps/${ targetTableId.value }`, {
        method: 'get',
        watch: false,
        immediate: false
    });

    const nodes = ref<Node[]>([]);

    const numNodes = ref<number>(0);

    const edges = ref<Edge[]>([]);

    async function populateNodesAndEdgesFromMap(map: Map) {
        console.log(map);

        nodes.value = map.nodes.map((node: any) => ({
            id: node.id.toString(),
            position: {
                x: node.position_x,
                y: node.position_y,
            },
            type: 'custom',
            data: { icon: `lucide:${ node.type }` }
        }));

        await nextTick();

        edges.value = map.edges.map((edge: any) => ({
            id: edge.id,
            source: edge.source_id.toString(),
            target: edge.target_id.toString(),
        }));

        numNodes.value = nodes.value.length ? Math.max(...nodes.value.map(n => Number(n.id))) : 0;
    }

    async function loadMap() {
        await mapRequest.refresh();

        await populateNodesAndEdgesFromMap(mapRequest.data.value as Map);
    }

    const loadMapState = ref(useAsyncState(loadMap));

    const saveMapState = ref();

    async function saveMap() {
        const payload = {
            details: {
                name: 'New Test Maps',
                created_by_id: 1,
            },
            nodes: nodes.value.map(node => ({
                id: Number(node.id),
                position_x: node.position.x,
                position_y: node.position.y,
                type: 'apple',
                map_id: targetTableId.value,
            })),
            edges: edges.value.map(edge => ({
                id: isNaN(Number(edge.id)) ? undefined : Number(edge.id),
                source_id: Number(edge.source),
                target_id: Number(edge.target),
            })),
        };

        saveMapState.value = useAsyncState(() =>
            $fetch<Map>(`/api/maps/${ targetTableId.value }`, {
                method: 'post',
                body: payload,
            })
        );
    }

    const createMapState = ref();

    function createMap() {
        createMapState.value = useAsyncState(() => $fetch<Map>('/api/maps', {
            method: 'post',
            body: {
                details: {
                    name: 'Another Test Map',
                    created_by_id: 1,
                },
                nodes: [],
                edges: [],
            }
        }).then(res => {
            targetTableId.value = res.id;
            loadMapState.value.retry();
        }));
    }

    function addNode(icon: string) {
        numNodes.value++;

        vueFlow.addNodes({
            id: (Math.floor(Math.random() * 1000)).toString(),
            position: {
                x: Math.round(window.innerWidth / 2),
                y: 200,
            },
            data: { icon },
            type: 'custom'
        });
    }

    vueFlow.onNodeDoubleClick(event => {
        if (event.node.id === nodes.value[0].id) return;

        vueFlow.removeNodes(event.node.id);
    });

    vueFlow.onConnect(({ source, target }) => {
        vueFlow.addEdges({
            source: source,
            target: target,
        });
    });

    const nodeIcons = [
        'lucide:apple',
        'lucide:anvil',
        'lucide:anchor',
    ];
</script>

<template>
    <VueFlow v-model:edges="edges" v-model:nodes="nodes">
        <Background/>
        <Panel position="top-center">
            <div class="flex gap-4">
                <UButton v-for="icon in nodeIcons" :key="icon" color="neutral" @click="addNode(icon)">
                    <UIcon :name="icon" size="30"/>
                </UButton>
                <div class="flex gap-2">
                    <UInput v-model="targetTableId" class="min-w-8" type="number"/>
                    <UButton :loading="loadMapState.isPending" label="Load Table" @click="loadMapState.retry"/>
                </div>
                <UButton :loading="saveMapState?.isPending" color="primary" label="Save" @click="saveMap"/>
                <UButton :loading="createMapState?.isPending" color="primary" label="Create Map" @click="createMap"/>
            </div>
        </Panel>

        <MiniMap mask-color="#202020" node-stroke-color="#00bc7d" node-stroke-width="20" pannable zoomable/>

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
