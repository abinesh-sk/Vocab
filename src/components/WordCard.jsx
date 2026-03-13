import React, { useState } from 'react'
import { deleteWord, updateWord } from '../utils/storage'
import { useApp } from '../hooks/useApp'

export default function WordCard({ word, compact = false, onRefresh }) {
  const [expanded, setExpanded] = useState(false)
  const { toast, refresh } = useApp()

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirm(`Delete "${word.word}"?`)) {
      deleteWord(word.id)
      refresh()
      toast(`"${word.word}" removed.`, 'info')
    }
  }

  const statusColors = {
    new: { bg: 'rgba(201,149,42,0.15)', color: '#7A5A10', label: 'New' },
    reviewing: { bg: 'rgba(122,140,110,0.18)', color: '#3A5A2A', label: 'Reviewing' },
    learned: { bg: 'rgba(74,47,32,0.12)', color: 'var(--brown-dark)', label: 'Learned ✓' },
  }
  const sc = statusColors[word.status] || statusColors.new

  const diffColors = {
    beginner: 'var(--sage)',
    intermediate: 'var(--gold)',
    advanced: 'var(--rust)',
  }

  if (compact) {
    return (
      <div
        className="paper-card"
        style={{ padding: '14px 18px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>{word.word}</span>
            <span style={{ fontSize: 12, color: 'rgba(44,24,16,0.45)', fontStyle: 'italic', fontFamily: 'Lora, serif' }}>{word.partOfSpeech}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: sc.bg, color: sc.color, fontWeight: 500 }}>{sc.label}</span>
            <span style={{ fontSize: 18, color: 'rgba(44,24,16,0.3)', lineHeight: 1 }}>{expanded ? '↑' : '↓'}</span>
          </div>
        </div>
        
        {expanded && (
          <div style={{ marginTop: 14, animation: 'fadeIn 0.25s ease' }}>
            <FullWordContent word={word} onDelete={handleDelete} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="paper-card-raised" style={{ padding: '28px 32px', animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 36, fontStyle: 'italic', letterSpacing: '-0.5px', marginBottom: 4 }}>{word.word}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {word.pronunciation && (
              <span style={{ fontFamily: 'Lora, serif', fontSize: 14, color: 'var(--brown-light)', fontStyle: 'italic' }}>{word.pronunciation}</span>
            )}
            <span className="tag tag-brown">{word.partOfSpeech}</span>
            {word.difficulty && (
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 12,
                background: `${diffColors[word.difficulty]}22`,
                color: diffColors[word.difficulty],
                fontWeight: 500, textTransform: 'capitalize',
              }}>{word.difficulty}</span>
            )}
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: sc.bg, color: sc.color, fontWeight: 500 }}>{sc.label}</span>
          </div>
        </div>
        <button onClick={handleDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(44,24,16,0.25)', fontSize: 18, padding: 4, lineHeight: 1 }}
          title="Delete word">✕</button>
      </div>

      <FullWordContent word={word} />
    </div>
  )
}

function FullWordContent({ word, onDelete }) {
  return (
    <div>
      {/* Definition */}
      <Section label="Definition">
        <p style={{ fontFamily: 'Lora, serif', fontSize: 15, lineHeight: 1.7, color: 'var(--ink)' }}>{word.definition}</p>
      </Section>

      {word.meaning && word.meaning !== word.definition && (
        <Section label="Deeper Meaning">
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-light)', fontStyle: 'italic', fontFamily: 'Lora, serif' }}>{word.meaning}</p>
        </Section>
      )}

      {/* When to use */}
      {word.whenToUse && (
        <Section label="When & Where to Use">
          <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--ink-light)' }}>{word.whenToUse}</p>
        </Section>
      )}

      {/* Example */}
      {word.example && (
        <div style={{ margin: '16px 0', padding: '16px 20px', background: 'rgba(139,94,60,0.07)', borderLeft: '3px solid var(--brown)', borderRadius: '0 8px 8px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brown-light)', marginBottom: 6 }}>Example</div>
          <p style={{ fontFamily: 'Lora, serif', fontSize: 15, fontStyle: 'italic', lineHeight: 1.65, color: 'var(--ink)' }}>"{word.example}"</p>
        </div>
      )}

      {/* Conversational tip */}
      {word.conversationalTip && (
        <div style={{ margin: '14px 0', padding: '12px 16px', background: 'rgba(122,140,110,0.1)', borderRadius: 8, display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 16 }}>💬</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: 4 }}>Conversation Tip</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-light)' }}>{word.conversationalTip}</p>
          </div>
        </div>
      )}

      {/* Synonyms */}
      {word.synonyms?.length > 0 && (
        <Section label="Synonyms">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {word.synonyms.map(s => (
              <span key={s} className="word-badge">{s}</span>
            ))}
          </div>
        </Section>
      )}

      {/* Origin */}
      {word.origin && (
        <Section label="Origin">
          <p style={{ fontSize: 13, color: 'rgba(44,24,16,0.55)', fontStyle: 'italic', fontFamily: 'Lora, serif' }}>{word.origin}</p>
        </Section>
      )}

      {/* Review count */}
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: 'rgba(44,24,16,0.4)' }}>
          Reviewed {word.reviewCount || 0} time{word.reviewCount !== 1 ? 's' : ''} · Added {new Date(word.addedDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
        </span>
        {word.reviewCount > 0 && (
          <div style={{ display: 'flex', gap: 3 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ width: 20, height: 4, borderRadius: 2, background: i <= word.reviewCount ? 'var(--brown)' : 'rgba(139,94,60,0.2)' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brown-light)', marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  )
}
