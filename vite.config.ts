import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    // 5174, so it can run next to zayun-web (5173); the API allows exactly this address (CORS)
    port: 5174,
    strictPort: true,
    watch: {
      ignored: ['**/.vs/**'],
    },
  },
})
