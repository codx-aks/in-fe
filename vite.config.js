import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: [
      '7d50-2401-4900-ca72-732-6828-f9f0-3782-319d.ngrok-free.app',
      '.trycloudflare.com',  
      '.ngrok.io',            
      'localhost'
    ],
    proxy: {
      '/api': {
        target: 'https://unstagily-creational-chandler.ngrok-free.dev',
        changeOrigin: true,
      }
    }
  }
})
