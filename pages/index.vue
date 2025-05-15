<script lang="ts" setup>
    const router = useRouter();
</script>

<template>
    <div class="flex justify-center items-center w-full h-full gap-4">
        <div class="flex flex-col !w-48 gap-6">
            <UButton label="Join a Session" size="xl" type="button" @click="router.push('/join')"/>
            <UButton label="View Your Maps" size="xl" type="button" @click="router.push('/maps')"/>
        </div>
    </div>
</template>
