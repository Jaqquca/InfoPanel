import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // bind to 0.0.0.0 for LAN access
    port: 5173,
    proxy: {
      // Proxy API requests to Express backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true, // Also proxy WebSocket connections for this path
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
