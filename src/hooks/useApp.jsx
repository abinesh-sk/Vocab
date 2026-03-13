import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getWords, getSettings, saveSettings, getDailyReview, setDailyReview, getStats } from '../utils/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [words, setWords] = useState([])
  const [settings, setSettingsState] = useState({ apiKey: '', reviewTime: '09:00' })
  const [dailyReview, setDailyReviewState] = useState(null)
  const [stats, setStats] = useState({})
  const [notification, setNotification] = useState(null)
  const [activeTab, setActiveTab] = useState('add')

  const refresh = useCallback(() => {
    setWords(getWords())
    setStats(getStats())
    const review = getDailyReview()
    setDailyReviewState(review)
  }, [])

  useEffect(() => {
    const saved = getSettings()
    if (saved.apiKey) setSettingsState(s => ({ ...s, ...saved }))
    refresh()
  }, [refresh])

  // Check if we should suggest daily review (after 9am, no review yet)
  const [showReviewPrompt, setShowReviewPrompt] = useState(false)
  useEffect(() => {
    const check = () => {
      const hour = new Date().getHours()
      const review = getDailyReview()
      const allWords = getWords()
      const unlearnedWords = allWords.filter(w => w.status !== 'learned')
      if (hour >= 9 && !review && unlearnedWords.length > 0) {
        setShowReviewPrompt(true)
      }
    }
    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [])

  // Check evening quiz (after 8pm, review exists, quiz not done)
  const [showQuizPrompt, setShowQuizPrompt] = useState(false)
  useEffect(() => {
    const check = () => {
      const hour = new Date().getHours()
      const review = getDailyReview()
      if (hour >= 20 && review && !review.quizCompleted) {
        setShowQuizPrompt(true)
      }
    }
    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [dailyReview])

  const updateSettings = (updates) => {
    const newSettings = { ...settings, ...updates }
    setSettingsState(newSettings)
    saveSettings(newSettings)
  }

  const toast = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() })
    setTimeout(() => setNotification(null), 3500)
  }

  const startDailyReview = () => {
    const allWords = getWords()
    const unlearnedWords = allWords.filter(w => w.status !== 'learned')
    if (unlearnedWords.length === 0) return toast('No words to review yet!', 'info')
    
    // Pick 3 random words
    const shuffled = [...unlearnedWords].sort(() => Math.random() - 0.5)
    const picked = shuffled.slice(0, Math.min(3, shuffled.length))
    const review = setDailyReview(picked.map(w => w.id))
    setDailyReviewState(review)
    setShowReviewPrompt(false)
    setActiveTab('review')
    toast(`Today's 3 words are ready! 📚`)
    return review
  }

  return (
    <AppContext.Provider value={{
      words,
      settings,
      updateSettings,
      dailyReview,
      setDailyReviewState,
      stats,
      refresh,
      toast,
      notification,
      activeTab,
      setActiveTab,
      showReviewPrompt,
      setShowReviewPrompt,
      showQuizPrompt,
      setShowQuizPrompt,
      startDailyReview,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
