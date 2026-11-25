import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ command, isPreview }) => ({
  // Served from https://markryd.github.io/thallboard/ in production. The dev
  // server stays at the root; build and preview use the Pages path.
  base: command === 'serve' && !isPreview ? '/' : '/thallboard/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
}))
