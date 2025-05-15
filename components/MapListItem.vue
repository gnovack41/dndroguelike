<script lang="ts" setup>
    defineProps<{ map: { id: string, name: string } }>();
</script>

<template>
    <div class="flex flex-col p-4 border rounded-2xl gap-2">
        <p>{{ map.name }}</p>
    </div>
</template>
