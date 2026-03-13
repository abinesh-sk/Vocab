import React from 'react'
import { useApp } from '../hooks/useApp'
import AddWord from '../pages/AddWord'
import MyWords from '../pages/MyWords'
import DailyReview from '../pages/DailyReview'
import EveningQuiz from '../pages/EveningQuiz'
import Stats from '../pages/Stats'
import Settings from '../pages/Settings'
import Banner from './Banner'

const NAV = [
  { id: 'add',      icon: '✦', label: 'Add Word' },
  { id: 'review',   icon: '☀', label: 'Daily Review' },
  { id: 'quiz',     icon: '◈', label: 'Evening Quiz' },
  { id: 'words',    icon: '📖', label: 'My Words' },
  { id: 'stats',    icon: '◉', label: 'Progress' },
  { id: 'settings', icon: '⚙', label: 'Settings' },
]

export default function Layout() {
  const { activeTab, setActiveTab, showReviewPrompt, showQuizPrompt, settings } = useApp()

  const pages = { add: AddWord, review: DailyReview, quiz: EveningQuiz, words: MyWords, stats: Stats, settings: Settings }
  const Page = pages[activeTab] || AddWord

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        minHeight: '100vh',
        background: '#0B0E18',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 0 24px',
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '0 24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 28, fontStyle: 'italic',
            color: '#E8EAF0',
            letterSpacing: '-0.5px',
          }}>
            Vocab
          </div>
          <div style={{
            fontSize: 11,
            color: 'rgba(138,146,168,0.6)',
            marginTop: 4,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            Vocabulary Garden
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '20px 12px' }}>
          {NAV.map(item => {
            const isActive = activeTab === item.id
            const hasBadge = (item.id === 'review' && showReviewPrompt) || (item.id === 'quiz' && showQuizPrompt)
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: '11px 14px',
                  background: isActive ? 'rgba(232,168,74,0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(232,168,74,0.2)' : '1px solid transparent',
                  borderRadius: 8, cursor: 'pointer',
                  color: isActive ? '#E8A84A' : 'rgba(138,146,168,0.8)',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 14,
                  fontWeight: isActive ? 500 : 400,
                  marginBottom: 4,
                  transition: 'all 0.18s',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 13, opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
                {hasBadge && (
                  <span style={{
                    position: 'absolute', right: 12,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#F06A6A',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* API key warning */}
        {!settings.apiKey && (
          <div style={{
            margin: '0 12px',
            padding: '12px',
            background: 'rgba(240,106,106,0.1)',
            border: '1px solid rgba(240,106,106,0.2)',
            borderRadius: 8,
            fontSize: 12,
            color: 'rgba(240,106,106,0.9)',
            lineHeight: 1.5,
          }}>
            ⚠ Set your Groq API key in Settings to get started.
          </div>
        )}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 220, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {(showReviewPrompt || showQuizPrompt) && <Banner />}
        <div style={{ flex: 1, padding: '40px 48px', maxWidth: 900 }}>
          <Page />
        </div>
      </main>
    </div>
  )
}
