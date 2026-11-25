import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'data')
const DATA_FILE = path.join(DATA_DIR, 'history.json')
const PORT = process.env.PORT || 3001
const MAX_RECORDS = 500

function readHistory() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  } catch {
    return []
  }
}

function writeHistory(list) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2))
}

export function createApp({ serveStatic = false } = {}) {
  const app = express()
  app.use(express.json())

  // GET /api/history — 获取计时完成历史（新→旧）
  app.get('/api/history', (req, res) => {
    res.json(readHistory())
  })

  // POST /api/history — 记录一次计时完成 { name, duration(秒) }
  app.post('/api/history', (req, res) => {
    const { name, duration } = req.body ?? {}
    if (!name || !Number.isFinite(duration) || duration <= 0) {
      return res.status(400).json({ error: '缺少字段 name/duration（秒）' })
    }
    const record = {
      id: Date.now(),
      name: String(name).slice(0, 50),
      duration: Math.round(duration),
      finishedAt: new Date().toISOString(),
    }
    const list = readHistory()
    list.unshift(record)
    writeHistory(list.slice(0, MAX_RECORDS))
    res.status(201).json(record)
  })

  // DELETE /api/history — 清空历史
  app.delete('/api/history', (req, res) => {
    writeHistory([])
    res.status(204).end()
  })

  // 生产模式：托管前端构建产物（dist/）
  if (serveStatic) {
    app.use(express.static(path.join(ROOT, 'dist')))
    // SPA 回退（Express 5 不支持 '*' 通配，改用中间件）
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(ROOT, 'dist', 'index.html'))
      }
      next()
    })
  }

  return app
}

export function startApiServer(options = {}) {
  const server = createApp(options).listen(PORT, () => {
    console.log(`[api] 后端接口已启动: http://localhost:${PORT}/api`)
  })
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[api] 端口 ${PORT} 已被占用，跳过（服务可能已在运行）`)
    } else {
      throw err
    }
  })
  return server
}

// 直接运行 `node server/index.js` 时：API + 托管 dist，单进程部署
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  startApiServer({ serveStatic: true })
}
