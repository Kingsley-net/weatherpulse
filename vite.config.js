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
      includeAssets: ['offline.html'],
      manifest: {
        name: 'Weather App',
        short_name: 'Weather',
        description: 'Live weather forecasts and updates',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2196f3',
        icons: [
          {
            src: 'weather192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'weather512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\/v1\/forecast.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 30 // 30 minutes
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /.*/i,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'fallback-cache',
              plugins: [
                {
                  cacheWillUpdate: async ({ response }) => {
                    return response?.status === 200 ? response : null
                  }
                }
              ],
              fallback: '/offline.html'
            }
          }
        ]
      }
    })
  ],
  css: {
    postcss: './postcss.config.cjs'
  }
})
