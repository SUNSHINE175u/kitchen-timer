import { useEffect, useRef } from 'react'
import { playAlarm, formatTime } from '../utils.js'
import { addHistory } from '../api.js'

function TimerCard({ timer, onUpdate, onDelete, soundOn, onDone }) {
  const intervalRef = useRef(null)
  const nameRef = useRef(timer.name)
  const totalRef = useRef(timer.total)
  nameRef.current = timer.name
  totalRef.current = timer.total

  useEffect(() => {
    if (timer.status === 'running') {
      intervalRef.current = setInterval(() => {
        onUpdate(timer.id, (prev) => {
          if (prev.remaining <= 1) {
            clearInterval(intervalRef.current)
            if (soundOn) playAlarm()
            if (navigator.vibrate) navigator.vibrate([300, 150, 300])
            // 通知后端记录本次计时完成（失败仅警告，不影响计时）
            addHistory(nameRef.current, totalRef.current)
              .then((record) => onDone?.(record))
              .catch((err) => console.warn('记录历史失败', err))
            return { ...prev, remaining: 0, status: 'done' }
          }
          return { ...prev, remaining: prev.remaining - 1 }
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [timer.status, timer.id, onUpdate, soundOn, onDone])

  const handleStartPause = () => {
    if (timer.status === 'running') {
      onUpdate(timer.id, () => ({ ...timer, status: 'paused' }))
    } else if (timer.status !== 'done') {
      onUpdate(timer.id, () => ({ ...timer, status: 'running' }))
    }
  }

  const handleReset = () => {
    onUpdate(timer.id, () => ({ ...timer, remaining: timer.total, status: 'idle' }))
  }

  const pct = timer.total > 0 ? (timer.remaining / timer.total) * 100 : 0

  return (
    <div className={`timer-card ${timer.status} ${timer.status === 'done' ? 'done' : ''}`}>
      <div className="timer-name">{timer.name}</div>
      <div className="timer-display">
        {timer.status === 'done' ? '⏰ 时间到!' : formatTime(timer.remaining)}
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }}></div>
      </div>
      <div className="timer-actions">
        {timer.status !== 'done' && (
          <button
            className={timer.status === 'running' ? 'btn-pause' : 'btn-start'}
            onClick={handleStartPause}
          >
            {timer.status === 'running' ? '⏸ 暂停' : '▶ 开始'}
          </button>
        )}
        <button className="btn-reset" onClick={handleReset}>↺ 重置</button>
        <button className="btn-del" onClick={() => onDelete(timer.id)}>✕</button>
      </div>
    </div>
  )
}

export default TimerCard
