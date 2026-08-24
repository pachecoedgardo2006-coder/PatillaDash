import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expone automáticamente en la red local (0.0.0.0) para celulares
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5136',
        changeOrigin: true,
      },
    },
  },
})
