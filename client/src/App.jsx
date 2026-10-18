import { useCallback, useEffect, useState } from 'react'
import { pickWords } from './data/words.js'
import Start from './screens/Start.jsx'
import Category from './screens/Category.jsx'
import DrawScreen from './screens/DrawScreen.jsx'
import ResultScreen from './screens/ResultScreen.jsx'
import FinalScreen from './screens/FinalScreen.jsx'
import Lobby from './screens/Lobby.jsx'
import MultiplayerDraw from './screens/MultiplayerDraw.jsx'
import MultiplayerResults from './screens/MultiplayerResults.jsx'
import { socket } from './socket'
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

  if (!imageBase64) {
    return {
      guesses: [],
      correct: false,
      error: 'No drawing was captured. Draw with the mouse, then click Done.',
    }
  }

  let data
  try {
    const res = await fetch('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, targetWord }),
    })
    data = await res.json()
    if (!res.ok) {
      return {
        guesses: data.guesses || [],
        correct: false,
        error: data.error || 'Guess failed',
      }
    }
  } catch {
    return {
      guesses: [],
      correct: false,
      error: 'Could not reach /api/guess. Use the Local URL from npm run dev and keep node index.js running.',
    }
  }

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

  // multiplayer state
  const [mpRound, setMpRound] = useState(null)
  const [mpResults, setMpResults] = useState(null)
  const [mpFinal, setMpFinal] = useState(null)

  const currentWord = roundWords[round - 1]?.text

  const handleMpRoundStart = useCallback((data) => {
    setMpRound(data)
    setMpResults(null)
    setScreen('mp-draw')
  }, [])

  const handleMpResults = useCallback((data) => {
    setMpResults(data)
    setScreen('mp-results')
  }, [])

  // multiplayer events that can arrive on any multiplayer screen
  useEffect(() => {
    function onRoundStart(data) {
      handleMpRoundStart(data)
    }
    function onGameOver(data) {
      setMpFinal(data)
      setScreen('mp-final')
    }
    socket.on('round_start', onRoundStart)
    socket.on('game_over', onGameOver)
    return () => {
      socket.off('round_start', onRoundStart)
      socket.off('game_over', onGameOver)
    }
  }, [handleMpRoundStart])

  function resetGame() {
    setScreen('start')
    setCategory(null)
    setRoundWords([])
    setRound(1)
    setScore(0)
    setResult(null)
  }

  function exitMultiplayer() {
    setMpRound(null)
    setMpResults(null)
    setMpFinal(null)
    setScreen('start')
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
    return (
      <Start
        onPlay={() => setScreen('category')}
        onMultiplayer={() => setScreen('lobby')}
      />
    )
  }

  if (screen === 'lobby') {
    return (
      <Lobby
        onBack={() => setScreen('start')}
        onRoundStart={handleMpRoundStart}
      />
    )
  }

  if (screen === 'mp-draw' && mpRound) {
    return (
      <MultiplayerDraw
        key={mpRound.round}
        roundInfo={mpRound}
        onResults={handleMpResults}
      />
    )
  }

  if (screen === 'mp-results' && mpResults) {
    return <MultiplayerResults data={mpResults} />
  }

  if (screen === 'mp-final' && mpFinal) {
    return <MultiplayerResults final={mpFinal} onExit={exitMultiplayer} />
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