<script lang="ts" setup>

    import { useAsyncState } from '../utils/services';

    const router = useRouter();

    const accessCode = ref();

    const submitState = ref();

    function submit() {
        submitState.value = useAsyncState(() => $fetch(
            '/api/sessions/join',
            { method: 'post', body: { access_code: accessCode.value } },
        ).then(async res => await router.push(`/maps/${ res }`)));
    }
</script>

<template>
    <div class="flex justify-center items-center w-full h-full gap-4">
        <form class="flex flex-col !w-96 gap-4" @submit.prevent="submit">
            <UFormField label="Access Code">
                <UInput v-model="accessCode" :disabled="submitState?.isPending" class="w-full" maxlength="6" required/>
            </UFormField>
            <UButton :loading="submitState?.isPending" label="Submit" type="submit"/>
        </form>
    </div>
</template>
