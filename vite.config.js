import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    open: false,
    proxy: {
      // rewrite netlify functions to local netlify-lambda server
      '/.netlify': {
        target: 'http://localhost:9000',
        rewrite: path => path.replace('^/.netlify/functions', '')
      }
    }
  }
})
