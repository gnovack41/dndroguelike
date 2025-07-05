// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
    files: ['**/*.ts', '**/*.vue'],
    rules: {
        '@typescript-eslint/no-dynamic-delete': 'warn',
        'vue/first-attribute-linebreak': 'off',
    }
})
