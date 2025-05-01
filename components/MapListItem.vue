<script lang="ts" setup>
    defineProps<{ map: { id: number, name: string } }>();
</script>

<template>
    <div class="flex flex-col p-4 border rounded-2xl gap-2">
        <p class="text-gray-400 text-sm">#{{ map.id }}</p>
        <p>{{ map.name }}</p>
    </div>
</template>
