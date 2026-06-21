import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const webContainerHeaders = {
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin"
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: webContainerHeaders,
    proxy : {
      '/cdn' : {
        target : 'https://unpkg.com',
        changeOrigin : true,
        rewrite : (path) => path.replace(/^\/cdn/, '')
      }
    }
  },
  preview: {
    headers: webContainerHeaders
  }
})
