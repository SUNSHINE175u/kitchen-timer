import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { startApiServer } from './server/index.js'

// 开发时让 Vite 顺带启动 Express 后端，一条 npm run dev 跑齐前后端
const apiPlugin = {
  name: 'kitchen-timer-api',
  configureServer() {
    startApiServer()
  },
}

export default defineConfig({
  plugins: [react(), apiPlugin],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
