import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite' // <-- 1. Import plugin Tailwind

// https://vite.dev/config/
export default defineConfig({
  base: '/tarot-app/',
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(), // <-- 2. Daftarkan plugin Tailwind
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
