// 播放提示音（Web Audio API，无需外部文件）
export function playAlarm(times = 3) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    let i = 0
    const beep = () => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start()
      osc.stop(ctx.currentTime + 0.45)
      if (++i < times) setTimeout(beep, 600)
    }
    beep()
  } catch (e) {
    console.warn('无法播放提示音', e)
  }
}

export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
