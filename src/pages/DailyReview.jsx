import React, { useState, useEffect } from 'react'
import { useApp } from '../hooks/useApp'
import { getWords, markWordReviewed, updateDailyReview } from '../utils/storage'
import WordCard from '../components/WordCard'

export default function DailyReview() {
  const { dailyReview, startDailyReview, refresh, toast, words } = useApp()
  const [reviewWords, setReviewWords] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [markedIds, setMarkedIds] = useState(new Set())

  useEffect(() => {
    if (dailyReview?.wordIds) {
      const allWords = getWords()
      const found = dailyReview.wordIds.map(id => allWords.find(w => w.id === id)).filter(Boolean)
      setReviewWords(found)
    }
  }, [dailyReview])

  const handleMarkReviewed = (id) => {
    markWordReviewed(id)
    setMarkedIds(prev => new Set([...prev, id]))
    refresh()
    toast('Word reviewed! Keep it up 🎉')
  }

  const unlearnedCount = words.filter(w => w.status !== 'learned').length

  if (!dailyReview) {
    return (
      <div>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 40, fontStyle: 'italic', letterSpacing: '-1px', marginBottom: 8 }}>Daily Review</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'Lora, serif', lineHeight: 1.6 }}>
            Three words a day keeps forgetting at bay.
          </p>
        </div>

        <div className="paper-card-raised" style={{ padding: 40, textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>☀️</div>
          <h2 style={{ fontStyle: 'italic', marginBottom: 12 }}>Start Today's Review</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Lora, serif' }}>
            {unlearnedCount > 0
              ? `You have ${unlearnedCount} word${unlearnedCount !== 1 ? 's' : ''} waiting to be reviewed. We'll pick 3 for you today.`
              : 'Add some words first, then come back to review them!'}
          </p>
          {unlearnedCount > 0 ? (
            <button className="btn btn-primary btn-lg" onClick={startDailyReview} style={{ width: '100%' }}>
              Pick My 3 Words ✦
            </button>
          ) : (
            <button className="btn btn-secondary btn-lg" onClick={() => {}} style={{ width: '100%', cursor: 'default' }}>
              No Words Yet
            </button>
          )}
        </div>

        <div style={{ marginTop: 32, padding: '20px 24px', background: 'rgba(78,205,196,0.07)', borderRadius: 10, border: '1px solid rgba(78,205,196,0.2)', maxWidth: 480 }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--teal)' }}>
            💡 Why 3 words a day?
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Research shows that reviewing small batches of vocabulary daily is far more effective than cramming. Three words is the sweet spot — enough to make progress, not enough to overwhelm.
          </p>
        </div>
      </div>
    )
  }

  const allReviewed = reviewWords.length > 0 && reviewWords.every(w => markedIds.has(w.id) || w.reviewCount > 0)

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 40, fontStyle: 'italic', letterSpacing: '-1px', marginBottom: 8 }}>Today's 3 Words</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'Lora, serif' }}>
          {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {reviewWords.map((w, i) => (
          <div key={w.id} style={{ flex: 1 }}>
            <div style={{ height: 4, borderRadius: 2, background: markedIds.has(w.id) || w.reviewCount > 0 ? 'var(--sage)' : 'rgba(139,94,60,0.2)' }} />
            <div style={{ fontSize: 11, marginTop: 4, color: 'rgba(44,24,16,0.5)', textAlign: 'center' }}>{i + 1}</div>
          </div>
        ))}
      </div>

      {/* Word cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {reviewWords.map((w, i) => (
          <div key={w.id} style={{ animation: `fadeIn 0.4s ease ${i * 0.1}s both` }}>
            <WordCard word={w} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              {markedIds.has(w.id) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--teal)', fontSize: 13, fontWeight: 500 }}>
                  <span>✓</span> Reviewed today
                </div>
              ) : (
                <button className="btn btn-secondary" onClick={() => handleMarkReviewed(w.id)}>
                  Mark as Reviewed ✓
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {allReviewed && (
        <div style={{ marginTop: 32, padding: '24px', background: 'rgba(78,205,196,0.08)', borderRadius: 12, border: '1px solid rgba(78,205,196,0.22)', textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎉</div>
          <h3 style={{ fontStyle: 'italic', marginBottom: 8 }}>Wonderful! All 3 words reviewed!</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, fontFamily: 'Lora, serif' }}>
            Try to use these words in a real conversation today. Come back tonight for your evening quiz!
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <div style={{ padding: '12px 20px', background: 'var(--surface)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: 'var(--amber)' }}>3</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Words Reviewed</div>
            </div>
            <div style={{ padding: '12px 20px', background: 'var(--surface)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: 'var(--teal)' }}>🌙</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Quiz Tonight</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
