<script lang="ts" setup>
    import MapListItem from '../../components/MapListItem.vue';
    import { v4 } from 'uuid';
    import type { ThinMap } from "~/utils/services/maps";

    const ALL_MAPS_KEY = 'all_maps';

    const router = useRouter();

    const allMaps = ref<ThinMap[]>([]);

    const allMapsString = localStorage.getItem(ALL_MAPS_KEY);
    if (allMapsString) {
        allMaps.value = JSON.parse(allMapsString);
    }

    const newMapName = ref<string>('');

    const createMapState = ref();

    async function createMap() {
        const newMapId = v4();

        const newMapData: ThinMap = {
            id: newMapId,
            name: newMapName.value,
            created: new Date().toISOString(),
        };

        localStorage.setItem(ALL_MAPS_KEY, JSON.stringify([
            ...allMaps.value,
            newMapData,
        ]));

        localStorage.setItem(newMapId, JSON.stringify({
            ...newMapData,
            nodes: [],
            edges: [],
        }));

        await router.push(`/maps/${ newMapId }`);
    }

    function deleteMap(mapId: string) {
        allMaps.value = allMaps.value.filter(map => map.id !== mapId);
        localStorage.setItem(ALL_MAPS_KEY, JSON.stringify(allMaps.value));
        localStorage.removeItem(mapId);
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
                @delete="deleteMap(map.id)"
            />
        </div>
    </div>
</template>
