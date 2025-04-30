<script lang="ts" setup>
    import type { FlowEvents, NodeProps } from '@vue-flow/core';
    import { Handle, Position } from '@vue-flow/core';

    defineProps<NodeProps<{
        isOrigin?: boolean,
        icon?: string,
    }>>();

    defineEmits<FlowEvents>();
</script>

<template>
    <Handle v-if="!data.isOrigin" :position="Position.Top" type="target"/>
    <div class="flex flex-col justify-center gap-1">
        <p v-if="data.isOrigin" class="text-sm text-center">Start</p>
        <div class="bg-emerald-500 rounded-full py-3 px-4">
            <UIcon v-if="data.icon" :name="data.icon"/>
        </div>
    </div>
    <Handle :position="Position.Bottom" type="source"/>
</template>
