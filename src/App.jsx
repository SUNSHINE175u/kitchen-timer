import { useState, useCallback } from 'react'
import TimerCard from './components/TimerCard.jsx'
import HistoryPanel from './components/HistoryPanel.jsx'
import { PRESETS } from './presets.js'

let nextId = 1

function App() {
  const [timers, setTimers] = useState([])
  const [customName, setCustomName] = useState('')
  const [customMin, setCustomMin] = useState('')
  const [soundOn, setSoundOn] = useState(true)
  const [historyRefresh, setHistoryRefresh] = useState(0)

  const handleTimerDone = useCallback(() => {
    setHistoryRefresh((n) => n + 1)
  }, [])

  const addTimer = (name, minutes) => {
    const secs = Math.round(minutes * 60)
    if (secs <= 0) return
    setTimers((prev) => [
      ...prev,
      { id: nextId++, name, total: secs, remaining: secs, status: 'idle' },
    ])
  }

  const handleAddCustom = () => {
    const min = parseFloat(customMin)
    if (!customName.trim() || isNaN(min) || min <= 0) return
    addTimer(customName.trim(), min)
    setCustomName('')
    setCustomMin('')
  }

  const updateTimer = useCallback((id, updater) => {
    setTimers((prev) => prev.map((t) => (t.id === id ? updater(t) : t)))
  }, [])

  const deleteTimer = useCallback((id) => {
    setTimers((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <div className="app">
      <button className="sound-toggle" onClick={() => setSoundOn(!soundOn)}>
        {soundOn ? '🔔 提示音开' : '🔕 提示音关'}
      </button>
      <h1>🍳 厨房计时器</h1>
      <p className="subtitle">多个菜品同时计时，到点响铃提醒</p>

      <div className="add-panel">
        <div className="presets">
          {PRESETS.map((p) => (
            <button key={p.name} className="preset-btn" onClick={() => addTimer(p.name, p.minutes)}>
              {p.name} · {p.minutes}分钟
            </button>
          ))}
        </div>
        <div className="custom-row">
          <input
            className="name-input"
            placeholder="自定义名称，如：红烧肉"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
          <input
            className="min-input"
            type="number"
            min="0.1"
            step="0.5"
            placeholder="分钟"
            value={customMin}
            onChange={(e) => setCustomMin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
          />
          <button
            className="add-btn"
            onClick={handleAddCustom}
            disabled={!customName.trim() || !customMin || parseFloat(customMin) <= 0}
          >
            + 添加
          </button>
        </div>
      </div>

      {timers.length === 0 ? (
        <div className="empty">还没有计时器，点击上方预设或自定义添加一个吧 👆</div>
      ) : (
        <div className="timers">
          {timers.map((t) => (
            <TimerCard
              key={t.id}
              timer={t}
              onUpdate={updateTimer}
              onDelete={deleteTimer}
              soundOn={soundOn}
              onDone={handleTimerDone}
            />
          ))}
        </div>
      )}

      <HistoryPanel refreshKey={historyRefresh} />
    </div>
  )
}

export default App
