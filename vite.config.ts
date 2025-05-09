import { defineConfig } from 'vite'

import { nodePolyfills } from 'vite-plugin-node-polyfills'

import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        nodePolyfills(),
        react()
    ],
    server: {
        port: 3000,
        host: '127.0.0.1',
    },
    resolve: {
        alias: {
            '@components': path.resolve(__dirname, 'src/components'),
            '@constants': path.resolve(__dirname, 'src/constants'),
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@styles': path.resolve(__dirname, 'src/assets/styles'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@hooks': path.resolve(__dirname, 'src/hooks'),
        },
    },
})
