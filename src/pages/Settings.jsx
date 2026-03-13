import React, { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { getWords, saveWords } from '../utils/storage'

export default function Settings() {
  const { settings, updateSettings, toast } = useApp()
  const [apiKey, setApiKey] = useState(settings.apiKey || '')
  const [showKey, setShowKey] = useState(false)
  const [importing, setImporting] = useState(false)

  const handleSave = () => {
    updateSettings({ apiKey: apiKey.trim() })
    toast('Settings saved!')
  }

  const handleExport = () => {
    const words = getWords()
    const data = JSON.stringify({ words, exportedAt: new Date().toISOString() }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vocab-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('Words exported!')
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        const words = data.words || data
        if (!Array.isArray(words)) throw new Error('Invalid format')
        const existing = getWords()
        const existingIds = new Set(existing.map(w => w.id))
        const newWords = words.filter(w => !existingIds.has(w.id))
        saveWords([...existing, ...newWords])
        toast(`Imported ${newWords.length} new word${newWords.length !== 1 ? 's' : ''}!`)
      } catch {
        toast('Import failed — invalid file format.', 'error')
      } finally {
        setImporting(false)
      }
    }
    reader.readAsText(file)
  }

  const handleClearAll = () => {
    if (confirm('This will delete ALL your words permanently. Are you sure?')) {
      saveWords([])
      toast('All words cleared.', 'info')
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 40, fontStyle: 'italic', letterSpacing: '-1px', marginBottom: 8 }}>Settings</h1>
        <p style={{ fontSize: 15, color: 'var(--ink-light)', fontFamily: 'Lora, serif', lineHeight: 1.6 }}>
          Configure your vocabulary garden.
        </p>
      </div>

      {/* API Key */}
      <div className="paper-card-raised" style={{ padding: 28, marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontStyle: 'italic', marginBottom: 6 }}>Groq API Key</h2>
        <p style={{ fontSize: 13.5, color: 'var(--ink-light)', marginBottom: 18, lineHeight: 1.6, fontFamily: 'Lora, serif' }}>
          Vocab uses the Groq API to fetch word definitions, usage examples, and generate quizzes. 
          Get your free key at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brown)', textDecoration: 'underline' }}>console.groq.com</a>.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              className="input"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="gsk_..."
              style={{ paddingRight: 44 }}
            />
            <button
              onClick={() => setShowKey(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brown-light)', fontSize: 16 }}
            >
              {showKey ? '🙈' : '👁'}
            </button>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
        {settings.apiKey && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--sage)' }}>
            <span>✓</span> API key is set and active
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="paper-card" style={{ padding: '20px 24px', marginBottom: 20, background: 'rgba(122,140,110,0.07)', border: '1px solid rgba(122,140,110,0.2)' }}>
        <h3 style={{ fontSize: 16, fontStyle: 'italic', marginBottom: 12 }}>How Vocab Works</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { step: '1', text: 'Add a word → Groq AI fetches definition, usage, examples, and tips.' },
            { step: '2', text: 'After 9am → A banner prompts your daily review of 3 random words.' },
            { step: '3', text: 'After 8pm → An evening quiz tests your recall with custom sentences.' },
            { step: '4', text: 'After 3 reviews → A word is marked "Learned" and moves out of rotation.' },
            { step: '5', text: 'Track streaks, totals, and difficulty breakdown in Progress.' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--brown)', color: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{step}</div>
              <p style={{ fontSize: 13.5, color: 'var(--ink-light)', lineHeight: 1.6 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data */}
      <div className="paper-card-raised" style={{ padding: 28, marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontStyle: 'italic', marginBottom: 6 }}>Your Data</h2>
        <p style={{ fontSize: 13.5, color: 'var(--ink-light)', marginBottom: 20, lineHeight: 1.6, fontFamily: 'Lora, serif' }}>
          All words are stored locally in your browser. Export to back up, or import to restore.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            ↓ Export Words
          </button>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            ↑ Import Words
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Danger zone */}
      <div className="paper-card" style={{ padding: '20px 24px', border: '1px solid rgba(196,98,45,0.25)' }}>
        <h3 style={{ fontSize: 16, fontStyle: 'italic', color: 'var(--rust)', marginBottom: 8 }}>Danger Zone</h3>
        <p style={{ fontSize: 13, color: 'var(--ink-light)', marginBottom: 14, fontFamily: 'Lora, serif' }}>Permanently delete all your words and progress. This cannot be undone.</p>
        <button className="btn btn-sm" onClick={handleClearAll} style={{ background: 'rgba(196,98,45,0.1)', color: 'var(--rust)', border: '1px solid rgba(196,98,45,0.3)' }}>
          Clear All Words
        </button>
      </div>

      {/* About */}
      <div style={{ marginTop: 32, padding: '16px 0', borderTop: '1px solid rgba(139,94,60,0.15)', fontSize: 12.5, color: 'rgba(44,24,16,0.4)', lineHeight: 1.7 }}>
        <strong style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: 'var(--brown-light)', fontStyle: 'italic' }}>Vocab</strong> — Your Personal Vocabulary Garden<br />
        Built with React + Vite · Powered by Groq AI · Data stored locally in your browser
      </div>
    </div>
  )
}
