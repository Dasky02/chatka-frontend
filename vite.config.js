import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // vše co začíná /api pošle Vite na Spring Boot na port 8080
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // path necháváme beze změny, protože BE má prefix /api
        // rewrite: (path) => path,  // není potřeba
      },
    },
  },
})
