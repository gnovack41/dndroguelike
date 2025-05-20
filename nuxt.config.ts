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
        bindings: {
            observability: {
                logs: true,
            },
        },
    },
    nitro: {
        experimental: {
            websocket: true,
        },
        preset: 'cloudflare_pages',
        cloudflare: {
            deployConfig: true,
            nodeCompat: true,
        },
    },
    ssr: false,
    debug: true,
});
