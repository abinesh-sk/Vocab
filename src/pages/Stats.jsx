import React, { useMemo } from 'react'
import { useApp } from '../hooks/useApp'
import { getDailyHistory, getWords } from '../utils/storage'

export default function Stats() {
  const { stats } = useApp()
  const history = useMemo(() => getDailyHistory(), [])
  const words = useMemo(() => getWords(), [])

  const maxCount = Math.max(...history.map(d => d.count), 1)
  const streak = useMemo(() => {
    let count = 0
    const today = new Date().toDateString()
    const allWords = getWords()
    const daySet = new Set(allWords.map(w => new Date(w.addedDate).toDateString()))
    
    for (let i = 0; i < 30; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      if (daySet.has(d.toDateString())) count++
      else if (i > 0) break
    }
    return count
  }, [])

  const partOfSpeechMap = useMemo(() => {
    const map = {}
    words.forEach(w => {
      const pos = w.partOfSpeech || 'other'
      map[pos] = (map[pos] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [words])

  const difficultyMap = useMemo(() => {
    const map = { beginner: 0, intermediate: 0, advanced: 0 }
    words.forEach(w => { if (w.difficulty) map[w.difficulty] = (map[w.difficulty] || 0) + 1 })
    return map
  }, [words])

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 40, fontStyle: 'italic', letterSpacing: '-1px', marginBottom: 8 }}>Your Progress</h1>
        <p style={{ fontSize: 15, color: 'var(--ink-light)', fontFamily: 'Lora, serif' }}>
          Track how your vocabulary garden grows over time.
        </p>
      </div>

      {/* Streak */}
      <div className="paper-card-raised" style={{ padding: 28, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ fontSize: 48 }}>🔥</div>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 700, color: 'var(--rust)', lineHeight: 1 }}>
            {streak} <span style={{ fontSize: 20, color: 'var(--rust)', fontStyle: 'italic' }}>day{streak !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 4 }}>Current streak — keep adding words daily!</div>
        </div>
      </div>

      {/* Main stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Words', value: stats.total || 0, icon: '📚', color: 'var(--brown)' },
          { label: 'This Week', value: stats.weekCount || 0, icon: '📅', color: 'var(--sage)' },
          { label: 'This Month', value: stats.monthCount || 0, icon: '🗓', color: 'var(--rust)' },
          { label: 'Today', value: stats.todayCount || 0, icon: '⭐', color: 'var(--gold)' },
          { label: 'Learned', value: stats.learned || 0, icon: '✓', color: 'var(--sage)' },
          { label: 'Reviewing', value: stats.reviewing || 0, icon: '◈', color: 'var(--brown-light)' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="paper-card" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Learning progress bar */}
      <div className="paper-card" style={{ padding: '22px 24px', marginBottom: 20 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, marginBottom: 16, fontStyle: 'italic' }}>Learning Status</div>
        {stats.total > 0 ? (
          <div>
            {[
              { label: 'New', count: stats.new || 0, color: 'var(--gold)', bg: 'rgba(201,149,42,0.18)' },
              { label: 'Reviewing', count: stats.reviewing || 0, color: 'var(--brown)', bg: 'rgba(139,94,60,0.15)' },
              { label: 'Learned', count: stats.learned || 0, color: 'var(--sage)', bg: 'rgba(122,140,110,0.18)' },
            ].map(({ label, count, color, bg }) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color }}>{label}</span>
                  <span style={{ fontSize: 13, color: 'var(--ink-light)' }}>{count} ({stats.total ? Math.round(count / stats.total * 100) : 0}%)</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${stats.total ? (count / stats.total * 100) : 0}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--ink-light)', fontStyle: 'italic', fontFamily: 'Lora, serif', fontSize: 14 }}>Add some words to see your progress!</p>
        )}
      </div>

      {/* 7-day chart */}
      <div className="paper-card" style={{ padding: '22px 24px', marginBottom: 20 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, marginBottom: 20, fontStyle: 'italic' }}>Words Added — Last 7 Days</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
          {history.map((day) => (
            <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--brown)', fontWeight: 600, visibility: day.count > 0 ? 'visible' : 'hidden' }}>
                {day.count}
              </div>
              <div
                style={{
                  width: '100%', minHeight: 4,
                  height: day.count > 0 ? `${(day.count / maxCount) * 90}px` : '4px',
                  background: day.date === new Date().toDateString()
                    ? 'linear-gradient(180deg, var(--rust), var(--brown))'
                    : day.count > 0 ? 'var(--brown-light)' : 'rgba(139,94,60,0.12)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.4s ease',
                }}
              />
              <div style={{ fontSize: 11, color: 'var(--ink-light)', whiteSpace: 'nowrap' }}>{day.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Part of speech breakdown */}
      {partOfSpeechMap.length > 0 && (
        <div className="paper-card" style={{ padding: '22px 24px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, marginBottom: 16, fontStyle: 'italic' }}>Word Types</div>
          {partOfSpeechMap.map(([pos, count]) => (
            <div key={pos} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 14, textTransform: 'capitalize', color: 'var(--ink-light)' }}>{pos}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 120, height: 6, borderRadius: 3, background: 'rgba(139,94,60,0.12)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(count / words.length) * 100}%`, background: 'var(--brown-light)', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, color: 'var(--brown)', fontWeight: 600, minWidth: 20, textAlign: 'right' }}>{count}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Difficulty breakdown */}
      {words.length > 0 && (
        <div className="paper-card" style={{ padding: '22px 24px' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, marginBottom: 16, fontStyle: 'italic' }}>Difficulty Mix</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { k: 'beginner', label: 'Beginner', color: 'var(--sage)' },
              { k: 'intermediate', label: 'Intermediate', color: 'var(--gold)' },
              { k: 'advanced', label: 'Advanced', color: 'var(--rust)' },
            ].map(({ k, label, color }) => (
              <div key={k} style={{ flex: 1, textAlign: 'center', padding: '16px', background: `${color}12`, borderRadius: 10, border: `1px solid ${color}30` }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color }}>{difficultyMap[k]}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
