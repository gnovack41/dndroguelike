<script lang="ts" setup>
    import MapListItem from '../../components/MapListItem.vue';
    import type { Map } from '../../utils/services/maps';

    const route = useRoute();
    const router = useRouter();

    const userId = route.params.id;

    const userFetch = await useFetch(`/api/users/${ userId }`);

    const newMapName = ref<string>();

    const createMapState = ref();

    function createMap() {
        createMapState.value = useAsyncState(() => $fetch<Map>('/api/maps', {
            method: 'post',
            body: {
                details: {
                    name: newMapName.value,
                    created_by_id: Number(userId),
                },
                nodes: [],
                edges: [],
            }
        }).then(async res => await router.push(`/maps/${ res.id }`)));
    }
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="flex justify-between">
            <h2 class="font-semibold text-2xl">{{ userFetch.data.value.name }}'s Maps</h2>
            <form class="flex items-end gap-2" @submit.prevent="createMap">
                <UFormField label="Name">
                    <UInput v-model="newMapName" :disabled="createMapState?.isPending" required/>
                </UFormField>
                <UButton :loading="createMapState?.isPending" class="h-fit" label="Create Map" type="submit"/>
            </form>
        </div>
        <div class="flex flex-wrap gap-8">
            <MapListItem
                v-for="map in userFetch.data.value.maps"
                :key="map.id"
                :map="map"
                class="cursor-pointer"
                @click="router.push(`/maps/${map.id}`)"
            />
        </div>
    </div>
</template>
