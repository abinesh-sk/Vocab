import React, { useState, useMemo } from 'react'
import { useApp } from '../hooks/useApp'
import WordCard from '../components/WordCard'

const FILTERS = [
  { id: 'all', label: 'All Words' },
  { id: 'new', label: 'New' },
  { id: 'reviewing', label: 'Reviewing' },
  { id: 'learned', label: 'Learned ✓' },
]

const SORTS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'alpha', label: 'A → Z' },
  { id: 'reviews', label: 'Most Reviewed' },
]

export default function MyWords() {
  const { words, refresh } = useApp()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')

  const filtered = useMemo(() => {
    let result = [...words]
    if (filter !== 'all') result = result.filter(w => w.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(w =>
        w.word.toLowerCase().includes(q) ||
        w.definition?.toLowerCase().includes(q) ||
        w.synonyms?.some(s => s.toLowerCase().includes(q))
      )
    }
    switch (sort) {
      case 'oldest': result.sort((a, b) => new Date(a.addedDate) - new Date(b.addedDate)); break
      case 'alpha': result.sort((a, b) => a.word.localeCompare(b.word)); break
      case 'reviews': result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)); break
      default: result.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
    }
    return result
  }, [words, filter, search, sort])

  const counts = {
    all: words.length,
    new: words.filter(w => w.status === 'new').length,
    reviewing: words.filter(w => w.status === 'reviewing').length,
    learned: words.filter(w => w.status === 'learned').length,
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 40, fontStyle: 'italic', letterSpacing: '-1px', marginBottom: 8 }}>My Words</h1>
        <p style={{ fontSize: 15, color: 'var(--ink-light)', fontFamily: 'Lora, serif' }}>
          {words.length} word{words.length !== 1 ? 's' : ''} in your vocabulary garden.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search words..."
          style={{ flex: '1 1 200px', maxWidth: 280 }}
        />
        <select
          className="input"
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{ width: 'auto', flex: '0 0 auto' }}
        >
          {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1px solid rgba(139,94,60,0.15)', paddingBottom: 16 }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
              background: filter === f.id ? 'var(--brown)' : 'rgba(139,94,60,0.1)',
              color: filter === f.id ? 'var(--parchment)' : 'var(--brown-dark)',
              transition: 'all 0.2s',
            }}
          >
            {f.label}
            <span style={{ marginLeft: 6, opacity: 0.7, fontSize: 11 }}>({counts[f.id]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-light)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>{words.length === 0 ? '📖' : '🔍'}</div>
          <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 16 }}>
            {words.length === 0 ? 'Your vocabulary garden is empty. Add your first word!' : 'No words match your search.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((w, i) => (
            <div key={w.id} style={{ animation: `fadeIn 0.3s ease ${Math.min(i * 0.05, 0.5)}s both` }}>
              <WordCard word={w} compact onRefresh={refresh} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
