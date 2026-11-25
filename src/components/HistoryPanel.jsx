import { useEffect, useState } from 'react'
import { fetchHistory, clearHistory } from '../api.js'
import { formatTime } from '../utils.js'

function formatFinishedAt(iso) {
  const d = new Date(iso)
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return sameDay ? `今天 ${hh}:${mm}` : `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`
}

function HistoryPanel({ refreshKey }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetchHistory()
      .then(setRecords)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [refreshKey])

  const handleClear = () => {
    clearHistory()
      .then(() => setRecords([]))
      .catch((err) => setError(err.message))
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <h2>🕘 完成记录</h2>
        {records.length > 0 && (
          <button className="btn-clear-history" onClick={handleClear}>清空</button>
        )}
      </div>
      {error && <div className="history-error">后端连接失败：{error}</div>}
      {!error && loading && <div className="history-empty">加载中…</div>}
      {!error && !loading && records.length === 0 && (
        <div className="history-empty">还没有完成记录，等一个计时器跑完就会出现 👀</div>
      )}
      {!error && !loading && records.length > 0 && (
        <ul className="history-list">
          {records.slice(0, 20).map((r) => (
            <li key={r.id} className="history-item">
              <span className="history-name">{r.name}</span>
              <span className="history-duration">⏱ {formatTime(r.duration)}</span>
              <span className="history-time">{formatFinishedAt(r.finishedAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default HistoryPanel
