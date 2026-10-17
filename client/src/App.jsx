import { useState } from 'react'
import { pickWords } from './data/words.js'
import Start from './screens/Start.jsx'
import Category from './screens/Category.jsx'
import DrawScreen from './screens/DrawScreen.jsx'
import ResultScreen from './screens/ResultScreen.jsx'
import FinalScreen from './screens/FinalScreen.jsx'
import HandTest from './HandTest'
import './screens/Start.css'

const TOTAL_ROUNDS = 5
const USE_MOCK_AI = true

async function getGuess(_imageBase64, _targetWord) {
  if (USE_MOCK_AI) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      guesses: ['cat', 'dog', 'fox'],
      correct: Math.random() > 0.5,
    }
  }

  return { guesses: [], correct: false }
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

  async function handleFinish(imageBase64) {
    setScreen('thinking')
    const nextResult = await getGuess(imageBase64, currentWord)
    if (nextResult.correct) {
      setScore((current) => current + 1)
    }
    setResult(nextResult)
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
        onSelect={(nextCategory) => {
          setCategory(nextCategory)
          setRoundWords(pickWords(nextCategory, TOTAL_ROUNDS))
          setRound(1)
          setScore(0)
          setResult(null)
          setScreen('draw')
        }}
      />
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
    >
    </DrawScreen>
  )
}

export default App
