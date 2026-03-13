# 📚 Vocab — Your Personal Vocabulary Garden

> A warm, elegant vocabulary tracker that helps you capture, understand, and truly learn words you encounter while reading.

---

## ✨ Features

- **Add Words** — Type any word and get an AI-powered breakdown: definition, part of speech, pronunciation, when & where to use it, a conversational example, synonyms, and even etymology.
- **Daily Review** — Every morning after 9am, the app prompts you to review 3 randomly chosen words from your unlearned collection.
- **Evening Quiz** — Each night after 8pm, a personalized quiz tests your recall — you write your own sentences using the day's 3 words, and AI evaluates your answers.
- **My Words** — Browse your entire collection with search, filter by status (New / Reviewing / Learned), and sort options.
- **Progress Stats** — Track your daily streak, words added today/this week/this month, learning status breakdown, a 7-day bar chart, and difficulty/word-type analytics.
- **Word Lifecycle** — Words automatically progress from *New → Reviewing → Learned* as you review them (3 reviews = Learned).
- **Export / Import** — Back up your entire vocabulary as JSON and restore it anytime.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run locally
```bash
npm run dev
```

### 3. Build for production
```bash
npm run build
```

---

## 🔑 Groq API Key

This app uses [Groq](https://console.groq.com) for AI-powered word definitions and quiz generation (it's free).

1. Sign up at [console.groq.com](https://console.groq.com)
2. Create a new API key
3. Open Vocab → go to **Settings** → paste your key → Save

---

## 🌐 Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Vercel auto-detects Vite — just click **Deploy**
4. No environment variables needed (API key is stored in your browser's localStorage)

---

## 🛠 Tech Stack

- **React 18** + **Vite** — Fast, modern frontend
- **Groq API** (llama-3.3-70b-versatile) — Word definitions, quiz generation, answer evaluation
- **localStorage** — All your words stored locally, no backend needed
- **Playfair Display + Lora + DM Sans** — Warm typographic palette
- **CSS Variables** — Parchment-toned warm design system

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.jsx       # Sidebar navigation
│   ├── Banner.jsx       # Morning/evening prompt banners
│   ├── Toast.jsx        # Notification toasts
│   └── WordCard.jsx     # Reusable word display card
├── pages/
│   ├── AddWord.jsx      # Word lookup + save
│   ├── DailyReview.jsx  # 3-word morning review
│   ├── EveningQuiz.jsx  # AI-evaluated evening quiz
│   ├── MyWords.jsx      # Word collection browser
│   ├── Stats.jsx        # Progress & analytics
│   └── Settings.jsx     # API key + data management
├── hooks/
│   └── useApp.jsx       # Global app state & context
└── utils/
    ├── storage.js       # localStorage CRUD + stats
    └── groq.js          # Groq API calls
```

---

## 💡 Tips

- Add words **one by one** as you encounter them while reading — the friction is intentional.
- Review daily but don't stress about perfection; the system tracks your progress automatically.
- Use the evening quiz answers as a journal of how your vocabulary is growing.
- Export your words occasionally as a backup.

---

Made with 📖 and ☕
