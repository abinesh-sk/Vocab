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
  { id: 'add', icon: '✦', label: 'Add Word' },
  { id: 'review', icon: '☀', label: 'Daily Review' },
  { id: 'quiz', icon: '◈', label: 'Evening Quiz' },
  { id: 'words', icon: '📖', label: 'My Words' },
  { id: 'stats', icon: '◉', label: 'Progress' },
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
        background: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 0 24px',
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '0 24px 32px', borderBottom: '1px solid rgba(245,236,215,0.1)' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontStyle: 'italic', color: 'var(--parchment)', letterSpacing: '-0.5px' }}>
            Vocab
          </div>
          <div style={{ fontSize: 11, color: 'rgba(245,236,215,0.45)', marginTop: 4, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>
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
                  background: isActive ? 'rgba(245,236,215,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(245,236,215,0.15)' : '1px solid transparent',
                  borderRadius: 8, cursor: 'pointer',
                  color: isActive ? 'var(--parchment)' : 'rgba(245,236,215,0.55)',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 14, fontWeight: isActive ? 500 : 400,
                  marginBottom: 4,
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: 14, opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                {item.label}
                {hasBadge && (
                  <span style={{
                    position: 'absolute', right: 12,
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--rust)', animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom note */}
        {!settings.apiKey && (
          <div style={{ margin: '0 12px', padding: '12px', background: 'rgba(196,98,45,0.2)', borderRadius: 8, fontSize: 12, color: 'rgba(245,236,215,0.7)', lineHeight: 1.5 }}>
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
