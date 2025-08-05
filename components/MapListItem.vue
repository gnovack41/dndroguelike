<script lang="ts" setup>
    import type { ThinMap } from "~/utils/services/maps";
    import { parseISO, format } from "date-fns";

    defineProps<{ map: ThinMap }>();

    defineEmits<{
        delete: [];
    }>();
</script>

<template>
    <div class="flex flex-col p-4 border rounded-2xl gap-2">
        <p class="font-medium">{{ map.name }}</p>
        <p class="text-sm">{{ format(parseISO(map.created), 'Pp') }}</p>
        <hr>
        <button
            type="button"
            class="text-red-600 text-sm font-medium cursor-pointer hover:opacity-80 z-50"
            @click.stop="$emit('delete')"
        >
            Delete
        </button>
    </div>
</template>
