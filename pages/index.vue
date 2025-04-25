<script lang="ts" setup>
import { format as formatDate, parseISO as parseISODate } from 'date-fns';
import type { UserResponse } from '~/server/api/users/index.get';

const users = ref<UserResponse[]>([]);

const isLoading = ref(false);

function loadUsers() {
    isLoading.value = true;

    $fetch('/api/users', { method: 'get' }).then(res => {
        users.value = res;
        isLoading.value = false;
    });
}

function getUser(id: number) {
    $fetch(`/api/users/${ id }`, { method: 'get' });
}

onBeforeMount(loadUsers);
</script>

<template>
    <div class="flex flex-col gap-2">
        <h3 class="text-2xl text-red-400 font-semibold">Welcome</h3>
        <UProgress :class="{ '!hidden': isLoading }" animation="swing"/>
        <UCard
            v-for="user in users"
            :key="user.id"
            variant="outline"
            @click="getUser(user.id)"
        >
            <template #header>
                {{ user.name }} {{ user.id }}
            </template>

            <div class="flex flex-col gap-1">
                <p>{{ user.email }}</p>
                <p>{{ formatDate(parseISODate(user.created_at), 'PPp') }}</p>
            </div>
        </UCard>
    </div>
</template>
