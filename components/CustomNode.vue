<script lang="ts" setup>
    import type { FlowEvents, NodeProps } from '@vue-flow/core';
    import { Handle, Position } from '@vue-flow/core';
    import { NodeToolbar } from '@vue-flow/node-toolbar';

    defineProps<NodeProps<{
        isOrigin?: boolean,
        icon?: string,
        explored: boolean,
    }>>();

    defineEmits<{ explored: [string] } & FlowEvents>();
</script>

<template>
    <NodeToolbar position="bottom">
        <UButton :label="data.explored ? 'Unexplore' : 'Explore'" color="neutral" @click="$emit('explored', id)"/>
    </NodeToolbar>

    <Handle v-if="!data.isOrigin" :connectable="connectable" :position="Position.Top" type="target"/>
    <div class="flex flex-col justify-center gap-1">
        <p v-if="data.isOrigin" class="text-sm text-center">Start</p>
        <div :class="{ '!bg-green-600': data.explored}" class="bg-blue-400 rounded-full py-3 px-4">
            <UIcon v-if="data.icon" :name="data.icon" class="text-black"/>
        </div>
    </div>
    <Handle :connectable="connectable" :position="Position.Bottom" type="source"/>
</template>
