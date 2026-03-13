// Storage keys
const KEYS = {
  WORDS: 'vocab_words',
  SETTINGS: 'vocab_settings',
  DAILY_REVIEW: 'vocab_daily_review',
  QUIZ_STATE: 'vocab_quiz_state',
}

// Word schema:
// {
//   id: string,
//   word: string,
//   definition: string,
//   partOfSpeech: string,
//   pronunciation: string,
//   meaning: string,
//   whenToUse: string,
//   example: string,
//   conversationalTip: string,
//   synonyms: string[],
//   addedDate: string (ISO),
//   reviewedDates: string[],
//   status: 'new' | 'reviewing' | 'learned',
//   reviewCount: number,
// }

export function getWords() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.WORDS) || '[]')
  } catch { return [] }
}

export function saveWords(words) {
  localStorage.setItem(KEYS.WORDS, JSON.stringify(words))
}

export function addWord(wordData) {
  const words = getWords()
  const existing = words.find(w => w.word.toLowerCase() === wordData.word.toLowerCase())
  if (existing) return { duplicate: true, word: existing }
  
  const newWord = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    ...wordData,
    addedDate: new Date().toISOString(),
    reviewedDates: [],
    status: 'new',
    reviewCount: 0,
  }
  words.unshift(newWord)
  saveWords(words)
  return { duplicate: false, word: newWord }
}

export function updateWord(id, updates) {
  const words = getWords()
  const idx = words.findIndex(w => w.id === id)
  if (idx === -1) return
  words[idx] = { ...words[idx], ...updates }
  saveWords(words)
  return words[idx]
}

export function deleteWord(id) {
  const words = getWords().filter(w => w.id !== id)
  saveWords(words)
}

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{}')
  } catch { return {} }
}

export function saveSettings(settings) {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings))
}

// Daily review: pick 3 words each morning
export function getDailyReview() {
  try {
    const data = JSON.parse(localStorage.getItem(KEYS.DAILY_REVIEW) || 'null')
    if (!data) return null
    const today = new Date().toDateString()
    if (data.date !== today) return null
    return data
  } catch { return null }
}

export function setDailyReview(wordIds) {
  const data = {
    date: new Date().toDateString(),
    wordIds,
    quizCompleted: false,
    quizAnswers: [],
  }
  localStorage.setItem(KEYS.DAILY_REVIEW, JSON.stringify(data))
  return data
}

export function updateDailyReview(updates) {
  try {
    const data = JSON.parse(localStorage.getItem(KEYS.DAILY_REVIEW) || 'null')
    if (!data) return
    const updated = { ...data, ...updates }
    localStorage.setItem(KEYS.DAILY_REVIEW, JSON.stringify(updated))
    return updated
  } catch { return null }
}

export function markWordReviewed(id) {
  const today = new Date().toISOString()
  const words = getWords()
  const word = words.find(w => w.id === id)
  if (!word) return

  const reviewedDates = [...(word.reviewedDates || []), today]
  const reviewCount = (word.reviewCount || 0) + 1
  const status = reviewCount >= 3 ? 'learned' : 'reviewing'
  
  updateWord(id, { reviewedDates, reviewCount, status })
}

// Stats
export function getStats() {
  const words = getWords()
  const today = new Date().toDateString()
  const thisWeek = getStartOfWeek()
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const todayWords = words.filter(w => new Date(w.addedDate).toDateString() === today)
  const weekWords = words.filter(w => new Date(w.addedDate) >= thisWeek)
  const monthWords = words.filter(w => new Date(w.addedDate) >= thisMonth)
  
  const learned = words.filter(w => w.status === 'learned')
  const reviewing = words.filter(w => w.status === 'reviewing')
  const newWords = words.filter(w => w.status === 'new')

  return {
    total: words.length,
    todayCount: todayWords.length,
    weekCount: weekWords.length,
    monthCount: monthWords.length,
    learned: learned.length,
    reviewing: reviewing.length,
    new: newWords.length,
  }
}

function getStartOfWeek() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Daily history for chart
export function getDailyHistory() {
  const words = getWords()
  const map = {}
  words.forEach(w => {
    const day = new Date(w.addedDate).toDateString()
    map[day] = (map[day] || 0) + 1
  })
  
  // Last 7 days
  const result = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toDateString()
    result.push({
      date: key,
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      count: map[key] || 0,
    })
  }
  return result
}
