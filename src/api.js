// 后端接口封装：开发环境走 Vite 代理（/api -> localhost:3001）
// 生产环境由 server/index.js 同源托管，无需改任何配置

async function request(pathname, options) {
  const res = await fetch(pathname, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `请求失败: ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export function fetchHistory() {
  return request('/api/history')
}

export function addHistory(name, duration) {
  return request('/api/history', {
    method: 'POST',
    body: JSON.stringify({ name, duration }),
  })
}

export function clearHistory() {
  return request('/api/history', { method: 'DELETE' })
}
