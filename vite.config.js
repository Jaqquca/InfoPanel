import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // bind to 0.0.0.0 for LAN access
    port: 5173,
    // No proxy needed in production - everything runs on single server
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
