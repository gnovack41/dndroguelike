// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },

    modules: [
        '@nuxt/content',
        '@nuxt/eslint',
        '@nuxt/icon',
        '@nuxt/image',
        '@nuxt/test-utils',
        '@nuxt/ui',
        '@nuxthub/core',
        '@vueuse/nuxt',
    ],
    css: ['~/assets/css/main.css', '~/assets/css/tailwind.css'],
    hub: {
        database: true,
        workers: true,
    },
    nitro: {
        experimental: {
            websocket: true,
        },
        cloudflare: {
            deployConfig: true,
        },
        preset: 'cloudflare_durable',
    },
    ssr: false,
    debug: true,
});
