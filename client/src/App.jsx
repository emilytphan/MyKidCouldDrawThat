import { useState } from 'react'
import { pickWords } from './data/words.js'
import Start from './screens/Start.jsx'
import Category from './screens/Category.jsx'
import DrawScreen from './screens/DrawScreen.jsx'
import ResultScreen from './screens/ResultScreen.jsx'
import FinalScreen from './screens/FinalScreen.jsx'
import './screens/Start.css'

const TOTAL_ROUNDS = 5
const USE_MOCK_AI = false

async function fetchRoundWords(category, count) {
  const picked = []

  for (let i = 0; i < count; i += 1) {
    const params = new URLSearchParams()
    if (category && category !== 'random') {
      params.set('category', category)
    }
    if (picked.length > 0) {
      params.set('exclude', picked.map((word) => word.text).join(','))
    }

    const query = params.toString()
    const res = await fetch(query ? `/api/word?${query}` : '/api/word')
    if (!res.ok) {
      throw new Error('Failed to load words')
    }
    const word = await res.json()
    picked.push({ text: word.text, category: word.category })
  }

  return picked
}

async function getGuess(imageBase64, targetWord) {
  if (USE_MOCK_AI) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      guesses: ['cat', 'dog', 'fox'],
      correct: Math.random() > 0.5,
    }
  }

  const res = await fetch('/api/guess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, targetWord }),
  })
  const data = await res.json()
  return {
    guesses: data.guesses || [],
    correct: Boolean(data.correct),
    comment: data.comment,
  }
}

function App() {
  const [screen, setScreen] = useState('start')
  const [category, setCategory] = useState(null)
  const [roundWords, setRoundWords] = useState([])
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [result, setResult] = useState(null)

  const currentWord = roundWords[round - 1]?.text

  function resetGame() {
    setScreen('start')
    setCategory(null)
    setRoundWords([])
    setRound(1)
    setScore(0)
    setResult(null)
  }

  async function handleSelectCategory(nextCategory) {
    setScreen('loading')
    try {
      const words = await fetchRoundWords(nextCategory, TOTAL_ROUNDS)
      setRoundWords(words)
    } catch {
      setRoundWords(pickWords(nextCategory, TOTAL_ROUNDS))
    }
    setCategory(nextCategory)
    setRound(1)
    setScore(0)
    setResult(null)
    setScreen('draw')
  }

  async function handleFinish(imageBase64) {
    setScreen('thinking')
    try {
      const nextResult = await getGuess(imageBase64, currentWord)
      if (nextResult.correct) {
        setScore((current) => current + 1)
      }
      setResult(nextResult)
    } catch {
      setResult({ guesses: [], correct: false })
    }
    setScreen('result')
  }

  function handleNext() {
    if (round >= TOTAL_ROUNDS) {
      setScreen('final')
      return
    }

    setResult(null)
    setRound((current) => current + 1)
    setScreen('draw')
  }

  if (screen === 'start') {
    return <Start onPlay={() => setScreen('category')} />
  }

  if (screen === 'category') {
    return (
      <Category
        onBack={() => setScreen('start')}
        onSelect={handleSelectCategory}
      />
    )
  }

  if (screen === 'loading') {
    return (
      <main className="start-page">
        <h1>Loading words...</h1>
      </main>
    )
  }

  if (screen === 'thinking') {
    return (
      <main className="start-page">
        <h1>AI is thinking...</h1>
      </main>
    )
  }

  if (screen === 'result') {
    return (
      <ResultScreen
        result={result}
        word={currentWord}
        onNext={handleNext}
      />
    )
  }

  if (screen === 'final') {
    return (
      <FinalScreen
        score={score}
        totalRounds={TOTAL_ROUNDS}
        onPlayAgain={resetGame}
      />
    )
  }

  return (
    <DrawScreen
      key={round}
      word={currentWord}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      onFinish={handleFinish}
    />
  )
}

export default App
