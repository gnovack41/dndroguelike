<script lang="ts" setup>

</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="flex w-full items-center justify-center h-16 bg-emerald-500">
            <h1 class="text-2xl ml-4 font-semibold" style="font-family: Comic Sans MS, Comic Sans, cursive;">
                Roguelike-ly
            </h1>
        </div>
        <div class="h-[90vh] px-6">
            <slot/>
        </div>
    </div>
</template>
