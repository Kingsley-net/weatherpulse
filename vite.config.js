import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    autoprefixer()

  ],
  css: {
    postcss: './postcss.config.cjs'
  }
})
