<script setup lang="ts">
    defineProps<{ icon: string }>();

    const emit = defineEmits<{
        click: [];
        'drag-end': [{ x: number, y: number }];
    }>()

    function onDragEnd(event: DragEvent) {
        event.preventDefault();

        emit('drag-end', { x: event.clientX, y: event.clientY });
    }
</script>

<template>
    <div draggable="true" @dragend="onDragEnd">
        <UButton
            class="aspect-square flex w-12 justify-center cursor-grab"
            color="neutral"
            @click="$emit('click')"
        >
            <UIcon :name="icon" size="30"/>
        </UButton>
    </div>
</template>
