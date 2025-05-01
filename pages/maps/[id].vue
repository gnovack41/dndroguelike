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

    const vueFlow = useVueFlow();

    const nodes = ref<Node[]>([]);
    const edges = ref<Edge[]>([]);

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
            data: { icon: `lucide:${ node.type }` }
        }));

        edges.value = map.edges.map((edge: any) => ({
            id: edge.id,
            source: edge.source_id.toString(),
            target: edge.target_id.toString(),
        }));
    }

    const saveMapState = ref();

    async function saveMap() {
        const payload = {
            details: {
                name: mapRequest.data.value!.name,
                created_by_id: mapRequest.data.value!.created_by_id,
            },
            nodes: nodes.value.map(node => ({
                id: Number(node.id),
                position_x: node.position.x,
                position_y: node.position.y,
                type: 'apple',
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
            })
        );
    }

    function addNode(icon: string) {
        vueFlow.addNodes({
            id: (Math.floor(Math.random() * 1000)).toString(),
            position: {
                x: Math.round(window.innerWidth / 2),
                y: 200,
            },
            data: { icon },
            type: 'custom'
        });

        saveMap();
    }

    vueFlow.onNodeDoubleClick(event => {
        vueFlow.removeNodes(event.node.id);

        saveMap();
    });

    vueFlow.onConnect(({ source, target }) => {
        vueFlow.addEdges({
            source: source,
            target: target,
        });

        saveMap();
    });

    vueFlow.onNodeDragStop(() => saveMap());

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
            <div class="flex gap-4 items-center">
                <UButton label="Back to Maps" @click="router.push(`/users/${mapRequest.data.value.created_by_id}`)"/>
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
