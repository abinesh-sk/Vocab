import React, { useState, useEffect } from 'react'
import { useApp } from '../hooks/useApp'
import { getWords, getDailyReview, updateDailyReview, markWordReviewed } from '../utils/storage'
import { generateQuiz, evaluateAnswer } from '../utils/groq'

export default function EveningQuiz() {
  const { settings, toast, refresh, dailyReview, setDailyReviewState } = useApp()
  const [phase, setPhase] = useState('intro') // intro | loading | quiz | done
  const [reviewWords, setReviewWords] = useState([])
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [evaluation, setEvaluation] = useState(null)
  const [evaluating, setEvaluating] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const review = getDailyReview()
    if (review?.wordIds) {
      const allWords = getWords()
      const found = review.wordIds.map(id => allWords.find(w => w.id === id)).filter(Boolean)
      setReviewWords(found)
      if (review.quizCompleted) {
        setPhase('done')
        if (review.quizAnswers) setResults(review.quizAnswers)
      }
    }
  }, [dailyReview])

  const startQuiz = async () => {
    if (!settings.apiKey) return setError('Please add your Groq API key in Settings.')
    if (reviewWords.length === 0) return setError('No words to quiz on today. Do your daily review first!')

    setPhase('loading')
    setError('')
    try {
      const qs = await generateQuiz(reviewWords, settings.apiKey)
      setQuestions(qs)
      setPhase('quiz')
    } catch (err) {
      setError(err.message)
      setPhase('intro')
    }
  }

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || evaluating) return
    const q = questions[currentQ]
    const word = reviewWords.find(w => w.word === q.word) || reviewWords[currentQ]
    
    setEvaluating(true)
    try {
      const eval_ = await evaluateAnswer(word, q.question, currentAnswer, settings.apiKey)
      setEvaluation(eval_)
    } catch {
      setEvaluation({ correct: true, score: 70, feedback: 'Good effort!', betterExample: currentAnswer })
    } finally {
      setEvaluating(false)
    }
  }

  const handleNext = () => {
    const newResults = [...results, { word: questions[currentQ].word, answer: currentAnswer, evaluation }]
    setResults(newResults)
    setAnswers(prev => [...prev, { q: currentQ, answer: currentAnswer, evaluation }])
    
    if (currentQ + 1 >= questions.length) {
      // Done
      const updated = updateDailyReview({ quizCompleted: true, quizAnswers: newResults })
      setDailyReviewState(updated)
      // Mark all words as reviewed
      reviewWords.forEach(w => markWordReviewed(w.id))
      refresh()
      setPhase('done')
    } else {
      setCurrentQ(prev => prev + 1)
      setCurrentAnswer('')
      setEvaluation(null)
    }
  }

  const avgScore = results.length > 0 ? Math.round(results.reduce((a, r) => a + (r.evaluation?.score || 70), 0) / results.length) : 0

  if (phase === 'done') {
    return (
      <div>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 40, fontStyle: 'italic', letterSpacing: '-1px', marginBottom: 8 }}>Evening Quiz</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'Lora, serif' }}>Today's review complete.</p>
        </div>

        <div className="paper-card-raised" style={{ padding: 36, textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{avgScore >= 80 ? '🌟' : avgScore >= 60 ? '⭐' : '💪'}</div>
          <h2 style={{ fontStyle: 'italic', marginBottom: 8 }}>Quiz Complete!</h2>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 52, fontWeight: 700, color: 'var(--amber)', margin: '16px 0' }}>
            {avgScore}<span style={{ fontSize: 24, color: 'rgba(232,168,74,0.7)' }}>%</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'Lora, serif', maxWidth: 360, margin: '0 auto' }}>
            {avgScore >= 80 ? "Exceptional! These words are becoming part of your natural vocabulary." : avgScore >= 60 ? "Good work! A little more practice and these words will be second nature." : "Keep going! Every attempt strengthens the neural pathways."}
          </p>
        </div>

        {results.map((r, i) => (
          <div key={i} className="paper-card" style={{ padding: '20px 24px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontStyle: 'italic' }}>{r.word}</span>
              <span style={{
                padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                background: (r.evaluation?.score || 70) >= 70 ? 'rgba(122,140,110,0.15)' : 'rgba(196,98,45,0.12)',
                color: (r.evaluation?.score || 70) >= 70 ? 'var(--sage)' : 'var(--rust)',
              }}>{r.evaluation?.score || '—'}%</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, fontStyle: 'italic', fontFamily: 'Lora, serif' }}>Your answer: "{r.answer}"</p>
            <p style={{ fontSize: 13.5, color: 'var(--text)' }}>{r.evaluation?.feedback}</p>
            {r.evaluation?.betterExample && r.evaluation.betterExample !== r.answer && (
              <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(232,168,74,0.07)', borderRadius: 6, fontSize: 13, fontStyle: 'italic', color: 'var(--amber)', fontFamily: 'Lora, serif' }}>
                Better: "{r.evaluation.betterExample}"
              </div>
            )}
          </div>
        ))}

        <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(78,205,196,0.07)', borderRadius: 10, fontSize: 13.5, color: 'var(--text-muted)', fontFamily: 'Lora, serif', lineHeight: 1.7 }}>
          ✨ Words reviewed today have been marked in your collection. Review them again tomorrow to lock them in for good!
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 40, fontStyle: 'italic', letterSpacing: '-1px', marginBottom: 8 }}>Evening Quiz</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'Lora, serif', lineHeight: 1.6 }}>
          Put today's words to the test. Use them in your own sentences.
        </p>
      </div>

      {phase === 'intro' && (
        <div>
          {reviewWords.length > 0 ? (
            <div>
              <div className="paper-card-raised" style={{ padding: 36 }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>🌙</div>
                <h2 style={{ fontStyle: 'italic', marginBottom: 12 }}>Ready for tonight's quiz?</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24, fontFamily: 'Lora, serif' }}>
                  We'll test your knowledge of today's 3 words: <strong>{reviewWords.map(w => w.word).join(', ')}</strong>. 
                  You'll write example sentences showing you understand how to use each word naturally.
                </p>
                {error && (
                  <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(240,106,106,0.1)', borderRadius: 8, fontSize: 13, color: 'var(--rust)' }}>{error}</div>
                )}
                <button className="btn btn-primary btn-lg" onClick={startQuiz} style={{ width: '100%' }}>
                  Begin Quiz ✦
                </button>
              </div>

              <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                {reviewWords.map(w => (
                  <div key={w.id} className="paper-card" style={{ flex: 1, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontStyle: 'italic', marginBottom: 4 }}>{w.word}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{w.partOfSpeech}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="paper-card-raised" style={{ padding: 36, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
              <h2 style={{ fontStyle: 'italic', marginBottom: 12 }}>No quiz today yet</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, fontFamily: 'Lora, serif' }}>
                Complete your daily review first to unlock tonight's quiz. Head to the Daily Review tab!
              </p>
            </div>
          )}
        </div>
      )}

      {phase === 'loading' && (
        <div className="paper-card-raised" style={{ padding: 60, textAlign: 'center' }}>
          <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 20px', borderWidth: 3 }} />
          <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', color: 'var(--text-muted)' }}>Crafting your personalized quiz...</p>
        </div>
      )}

      {phase === 'quiz' && questions.length > 0 && (
        <div>
          {/* Progress */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {questions.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < currentQ ? 'var(--sage)' : i === currentQ ? 'var(--brown)' : 'rgba(139,94,60,0.2)', transition: 'background 0.3s' }} />
            ))}
          </div>

          <div className="paper-card-raised" style={{ padding: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(232,168,74,0.7)' }}>Question {currentQ + 1} of {questions.length}</span>
              <span style={{ fontSize: 12, fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: 'var(--amber)', background: 'rgba(232,168,74,0.1)', padding: '2px 10px', borderRadius: 12 }}>{questions[currentQ].word}</span>
            </div>

            <h3 style={{ fontSize: 20, fontStyle: 'italic', lineHeight: 1.5, marginBottom: 24, color: 'var(--text)' }}>
              {questions[currentQ].question}
            </h3>

            {questions[currentQ].hint && (
              <div style={{ marginBottom: 16, padding: '8px 14px', background: 'rgba(232,168,74,0.08)', border: '1px solid rgba(232,168,74,0.2)', borderRadius: 6, fontSize: 12.5, color: 'var(--amber)', fontStyle: 'italic' }}>
                💡 Hint: {questions[currentQ].hint}
              </div>
            )}

            <textarea
              className="input"
              value={currentAnswer}
              onChange={e => setCurrentAnswer(e.target.value)}
              placeholder="Write your answer here..."
              rows={4}
              style={{ resize: 'vertical', fontFamily: 'Lora, serif', fontSize: 15, lineHeight: 1.65 }}
              disabled={!!evaluation}
            />

            {!evaluation && (
              <button
                className="btn btn-primary"
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim() || evaluating}
                style={{ marginTop: 14, width: '100%' }}
              >
                {evaluating ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Evaluating...</> : 'Submit Answer'}
              </button>
            )}

            {evaluation && (
              <div style={{ marginTop: 20, animation: 'fadeIn 0.35s ease' }}>
                <div style={{
                  padding: '16px 20px', borderRadius: 10,
                  background: evaluation.score >= 70 ? 'rgba(122,140,110,0.1)' : 'rgba(196,98,45,0.08)',
                  border: `1px solid ${evaluation.score >= 70 ? 'rgba(122,140,110,0.3)' : 'rgba(196,98,45,0.25)'}`,
                  marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: evaluation.score >= 70 ? 'var(--sage)' : 'var(--rust)', fontSize: 15 }}>
                      {evaluation.score >= 70 ? '✓ Well done!' : '✗ Almost there!'}
                    </span>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: evaluation.score >= 70 ? 'var(--sage)' : 'var(--rust)' }}>{evaluation.score}%</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{evaluation.feedback}</p>
                  {evaluation.betterExample && evaluation.betterExample !== currentAnswer && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(232,168,74,0.7)', marginBottom: 4 }}>A strong example</div>
                      <p style={{ fontSize: 13.5, fontStyle: 'italic', fontFamily: 'Lora, serif', color: 'var(--text)', lineHeight: 1.6 }}>"{evaluation.betterExample}"</p>
                    </div>
                  )}
                </div>

                <button className="btn btn-primary" onClick={handleNext} style={{ width: '100%' }}>
                  {currentQ + 1 >= questions.length ? 'See Results' : 'Next Question →'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
