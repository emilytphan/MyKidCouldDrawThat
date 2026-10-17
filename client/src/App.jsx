import { useState } from 'react'
import { pickWords } from './data/words.js'
import Start from './screens/Start.jsx'
import Category from './screens/Category.jsx'
import './screens/Start.css'

function App() {
  const [screen, setScreen] = useState('start')
  const [category, setCategory] = useState(null)
  const [roundWords, setRoundWords] = useState([])

  if (screen === 'start') {
    return <Start onPlay={() => setScreen('category')} />
  }

  if (screen === 'category') {
    return (
      <Category
        onBack={() => setScreen('start')}
        onSelect={(nextCategory) => {
          setCategory(nextCategory)
          setRoundWords(pickWords(nextCategory, 5))
          setScreen('draw')
        }}
      />
    )
  }

  return (
    <main className="start-page">
      <h1>Draw</h1>
      <p>
        Placeholder for the draw screen. Mode:{' '}
        <strong>{category === 'random' ? 'random mix' : category}</strong>
      </p>
      <ol>
        {roundWords.map((word) => (
          <li key={word.text}>
            {word.text} ({word.category})
          </li>
        ))}
      </ol>
      <button type="button" className="start-play" onClick={() => setScreen('category')}>
        Back to categories
      </button>
    </main>
  )
}

export default App
