import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis', // Add this line to fix global is not defined
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['@stomp/stompjs', 'sockjs-client'] // Optional: improves performance
  }
})