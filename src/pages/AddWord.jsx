import React, { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { fetchWordDefinition } from '../utils/groq'
import { addWord } from '../utils/storage'
import WordCard from '../components/WordCard'

export default function AddWord() {
  const { settings, toast, refresh } = useApp()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [recentAdded, setRecentAdded] = useState([])
  const [sessionCount, setSessionCount] = useState(0)

  const handleLookup = async (e) => {
    e.preventDefault()
    const word = input.trim()
    if (!word) return
    if (!settings.apiKey) return setError('Please add your Groq API key in Settings first.')
    
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const data = await fetchWordDefinition(word, settings.apiKey)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch definition. Check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!result) return
    const { duplicate, word: saved } = addWord(result)
    if (duplicate) {
      toast(`"${result.word}" is already in your collection!`, 'info')
    } else {
      toast(`"${saved.word}" added to your vocabulary garden! 🌱`)
      setRecentAdded(prev => [saved, ...prev.slice(0, 4)])
      setSessionCount(c => c + 1)
      refresh()
    }
    setInput('')
    setResult(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLookup(e)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 40, fontStyle: 'italic', letterSpacing: '-1px', marginBottom: 8 }}>
          Add a Word
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ink-light)', fontFamily: 'Lora, serif', lineHeight: 1.6 }}>
          Encountered a new word? Let's explore its meaning, usage, and help you make it yours.
        </p>
        {sessionCount > 0 && (
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(122,140,110,0.12)', borderRadius: 20, border: '1px solid rgba(122,140,110,0.25)' }}>
            <span style={{ fontSize: 14 }}>🌱</span>
            <span style={{ fontSize: 13, color: 'var(--sage)', fontWeight: 500 }}>{sessionCount} word{sessionCount !== 1 ? 's' : ''} added this session</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="paper-card-raised" style={{ padding: 28, marginBottom: 28 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brown-light)', marginBottom: 10 }}>
          Enter a word
        </label>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. ephemeral, melancholy, serendipity..."
            style={{ fontSize: 17, fontFamily: 'Playfair Display, serif', fontStyle: input ? 'italic' : 'normal' }}
            autoFocus
          />
          <button
            className="btn btn-primary"
            onClick={handleLookup}
            disabled={loading || !input.trim()}
            style={{ whiteSpace: 'nowrap', minWidth: 130 }}
          >
            {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Looking up...</> : '✦ Look Up'}
          </button>
        </div>
        {error && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(196,98,45,0.1)', border: '1px solid rgba(196,98,45,0.25)', borderRadius: 8, fontSize: 13, color: 'var(--rust)' }}>
            {error}
          </div>
        )}
        <p style={{ marginTop: 10, fontSize: 12, color: 'rgba(44,24,16,0.4)' }}>
          Press Enter or click Look Up to fetch definition, usage, and examples.
        </p>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="paper-card-raised" style={{ padding: 32 }}>
          <div className="skeleton" style={{ height: 40, width: '35%', marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 80, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 60 }} />
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <WordCard word={{ ...result, status: 'new', reviewCount: 0, addedDate: new Date().toISOString() }} />
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="btn btn-primary btn-lg" onClick={handleSave} style={{ flex: 1 }}>
              🌱 Save to My Collection
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => { setResult(null); setInput('') }}>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Recently added this session */}
      {recentAdded.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: 18, marginBottom: 16, fontStyle: 'italic' }}>Added this session</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentAdded.map(w => (
              <WordCard key={w.id} word={w} compact />
            ))}
          </div>
        </div>
      )}

      {/* Tips when empty */}
      {!result && !loading && recentAdded.length === 0 && (
        <div style={{ marginTop: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { icon: '📚', title: 'Read & Notice', tip: 'Whenever you encounter an unfamiliar word while reading, jot it down and look it up here.' },
              { icon: '💬', title: 'Learn in Context', tip: 'Each word comes with real conversational examples so you know exactly when to use it.' },
              { icon: '☀️', title: 'Daily Review', tip: '3 words every morning — just enough to learn without overwhelming yourself.' },
              { icon: '🌙', title: 'Evening Quiz', tip: 'A short quiz at night reinforces memory and helps words stick for good.' },
            ].map(({ icon, title, tip }) => (
              <div key={title} className="paper-card" style={{ padding: '20px 22px' }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{title}</div>
                <p style={{ fontSize: 13, color: 'var(--ink-light)', lineHeight: 1.6 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
