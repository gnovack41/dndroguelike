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
            <UAlert
                v-if="submitState?.isRejected && submitState.error.data.statusCode === 400"
                color="error"
                description="Please update it and try again"
                title="Invalid Access Code"
            />
            <UButton :loading="submitState?.isPending" label="Submit" type="submit"/>
        </form>
    </div>
</template>
