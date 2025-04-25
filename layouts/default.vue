<script lang="ts" setup>

const isLoading = ref(false);

const key = ref(0);

async function createTestUser() {
    isLoading.value = true;

    await $fetch('/api/users', {
        method: 'post',
        body: {name: 'Gab Nov', email: 'gab@example.com'},
    })

    isLoading.value = false;
    key.value++;
}
</script>

<template>
    <div>
        <div class="flex w-full h-24 gap-16 bg-blue-800 px-8 items-center">
            <button class="bg-blue-600 p-4 rounded-xl h-fit px-8 hover:!bg-blue-700" type="button"><a href="/">Home</a>
            </button>
            <button class="bg-blue-600 p-4 rounded-xl h-fit px-8 hover:!bg-blue-700" type="button"><a href="/hello">Hello</a>
            </button>
            <button class="bg-blue-600 p-4 rounded-xl h-fit px-8 hover:!bg-blue-700" type="button"><a href="/world">World</a>
            </button>
            <UButton :loading="isLoading" label="Create User" @click="createTestUser"/>
        </div>

        <slot :key="key"/>
    </div>
</template>
