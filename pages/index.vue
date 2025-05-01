<script lang="ts" setup>
    import { useAsyncState } from '../utils/services';
    import type { User } from '../server/utils/drizzle';

    const router = useRouter();

    const userName = ref<string>();

    const submitUserState = ref();

    function submit() {
        submitUserState.value = useAsyncState(() => $fetch<User>('/api/users', {
            method: 'post',
            body: { name: userName.value }
        }).then(async res => await router.push(`users/${ res.id }`)));
    }
</script>

<template>
    <div class="flex justify-center items-center w-full h-full gap-4">
        <form class="flex flex-col !w-96 gap-4" @submit.prevent="submit">
            <UFormField label="User Name">
                <UInput v-model="userName" :disabled="submitUserState?.isPending" class="w-full" required/>
            </UFormField>
            <UButton :loading="submitUserState?.isPending" label="Submit" type="submit"/>
        </form>
    </div>
</template>
