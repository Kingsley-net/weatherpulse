import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

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
            type: 'image/png',
          },
          {
            src: 'weather512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      }
    })
  ],
  css: {
    postcss: './postcss.config.cjs',
  },
  build: {
    chunkSizeWarningLimit: 1500,
  }
});
