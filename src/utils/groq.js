const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function fetchWordDefinition(word, apiKey) {
  const prompt = `You are a sophisticated vocabulary teacher. Analyze the word "${word}" and respond with ONLY a valid JSON object (no markdown, no extra text) in exactly this format:

{
  "word": "${word}",
  "pronunciation": "phonetic pronunciation e.g. /prəˌnʌnsiˈeɪʃən/",
  "partOfSpeech": "noun/verb/adjective/adverb/etc",
  "definition": "Clear, concise definition in 1-2 sentences",
  "meaning": "Deeper meaning or nuance, what the word truly conveys",
  "whenToUse": "Specific contexts and situations where this word fits naturally — be practical and specific",
  "example": "A vivid, realistic example sentence using this word in everyday conversation",
  "conversationalTip": "A short tip on how to naturally slip this word into daily conversation without sounding unnatural",
  "synonyms": ["synonym1", "synonym2", "synonym3"],
  "difficulty": "beginner/intermediate/advanced",
  "origin": "Brief etymology if interesting, otherwise empty string"
}`

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 600,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content?.trim()
  
  try {
    // Strip any markdown fences if present
    const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
    return JSON.parse(clean)
  } catch {
    throw new Error('Failed to parse word definition. Please try again.')
  }
}

export async function generateQuiz(words, apiKey) {
  const wordList = words.map(w => `${w.word}: ${w.definition}`).join('\n')
  
  const prompt = `You are a vocabulary quiz master. Based on these words a student learned today:

${wordList}

Create a fun quiz with exactly ${words.length} questions (one per word). For each word, create ONE question that tests their understanding in a conversational context. Use a mix of:
- "Use this word in a sentence about [everyday situation]"
- "How would you use '${words[0]?.word}' when talking to a friend about...?"
- "Complete this sentence naturally using today's word..."

Respond ONLY with a valid JSON array:
[
  {
    "wordId": "word_index_0_to_${words.length - 1}",
    "word": "the word being tested",
    "question": "Your conversational question here",
    "hint": "A subtle hint that doesn't give it away",
    "sampleAnswer": "A natural example answer using the word correctly"
  }
]`

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 800,
    }),
  })

  if (!response.ok) throw new Error('Quiz generation failed')
  
  const data = await response.json()
  const text = data.choices?.[0]?.message?.content?.trim()
  
  try {
    const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
    return JSON.parse(clean)
  } catch {
    throw new Error('Failed to generate quiz.')
  }
}

export async function evaluateAnswer(word, question, userAnswer, apiKey) {
  const prompt = `You are evaluating a vocabulary exercise. 

Word: "${word.word}" (${word.definition})
Question: "${question}"
Student's answer: "${userAnswer}"

Evaluate if the student used the word correctly and naturally. Respond ONLY with JSON:
{
  "correct": true or false,
  "score": 0-100,
  "feedback": "Warm, encouraging feedback in 1-2 sentences. If wrong, explain gently.",
  "betterExample": "A refined version of their answer or a great alternative"
}`

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 250,
    }),
  })

  if (!response.ok) throw new Error('Evaluation failed')
  
  const data = await response.json()
  const text = data.choices?.[0]?.message?.content?.trim()
  
  try {
    const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
    return JSON.parse(clean)
  } catch {
    return { correct: true, score: 75, feedback: "Good effort!", betterExample: userAnswer }
  }
}
