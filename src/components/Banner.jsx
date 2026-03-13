import React from 'react'
import { useApp } from '../hooks/useApp'

export default function Banner() {
  const { showReviewPrompt, showQuizPrompt, startDailyReview, setActiveTab, setShowReviewPrompt, setShowQuizPrompt } = useApp()

  if (showReviewPrompt) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1A2A1A 0%, #2A1A10 100%)',
        color: 'var(--text)',
        padding: '14px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>☀️</span>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 600 }}>Good morning! Time for your daily vocabulary review.</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>3 random words await your attention today.</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm" onClick={startDailyReview}
            style={{ background: 'rgba(255,255,255,0.2)', color: 'var(--text)', border: '1px solid rgba(255,255,255,0.3)' }}>
            Start Review →
          </button>
          <button onClick={() => setShowReviewPrompt(false)}
            style={{ background: 'none', border: 'none', color: 'rgba(245,236,215,0.6)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      </div>
    )
  }

  if (showQuizPrompt) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #12121E 0%, #1A1A2E 100%)',
        color: 'var(--text)',
        padding: '14px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🌙</span>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 600 }}>Evening check-in! How well do you remember today's words?</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>A quick quiz to reinforce your learning before bed.</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm" onClick={() => { setActiveTab('quiz'); setShowQuizPrompt(false) }}
            style={{ background: 'rgba(255,255,255,0.2)', color: 'var(--text)', border: '1px solid rgba(255,255,255,0.3)' }}>
            Take Quiz →
          </button>
          <button onClick={() => setShowQuizPrompt(false)}
            style={{ background: 'none', border: 'none', color: 'rgba(245,236,215,0.6)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      </div>
    )
  }

  return null
}
