import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'PERFX - Risk Engine',
        short_name: 'PERFX',
        description: 'Motor de Evaluación y Detección de Fraude Bancario',
        theme_color: '#1B2A4A',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          { src: '/favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/favicon.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'perfx-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
})
