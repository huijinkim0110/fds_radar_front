import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:9090",
        changeOrigin: true,
      },
    },
  },
})
=======
})
>>>>>>> b5a51bb203011154e3bba858b5d480d3ad671ead
