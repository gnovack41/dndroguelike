<script lang="ts" setup>
    import MapListItem from '../../components/MapListItem.vue';
    import { v4 } from 'uuid';

    const ALL_MAPS_KEY = 'all_maps';

    const router = useRouter();

    const allMaps = ref<{ id: string, name: string }[]>([]);

    const allMapsString = localStorage.getItem(ALL_MAPS_KEY);
    if (allMapsString) {
        allMaps.value = JSON.parse(allMapsString);
    }

    const newMapName = ref<string>();

    const createMapState = ref();

    async function createMap() {
        const newMapId = v4();
        localStorage.setItem(ALL_MAPS_KEY, JSON.stringify([
            ...allMaps.value,
            { 'id': newMapId, name: newMapName.value },
        ]));

        localStorage.setItem(newMapId, JSON.stringify({
            name: newMapName.value,
            nodes: [],
            edges: [],
        }));

        await router.push(`/maps/${ newMapId }`);
    }
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="flex justify-between">
            <h2 class="font-semibold text-2xl">Your Maps</h2>
            <form class="flex items-end gap-2"
                  @submit.prevent="createMapState = useAsyncState<void>(() => createMap())">
                <UFormField label="Name">
                    <UInput v-model="newMapName" :disabled="createMapState?.isPending" required/>
                </UFormField>
                <UButton :loading="createMapState?.isPending" class="h-fit" label="Create Map" type="submit"/>
            </form>
        </div>
        <div class="flex flex-wrap gap-8">
            <MapListItem
                v-for="map in allMaps"
                :key="map.id"
                :map="map"
                class="cursor-pointer"
                @click="router.push(`/maps/${map.id}`)"
            />
        </div>
    </div>
</template>
