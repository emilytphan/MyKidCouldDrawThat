import './ResultScreen.css'

export default function ResultScreen({ result, word, onNext }) {
  const guesses = result?.guesses ?? []
  const correct = Boolean(result?.correct)

  return (
    <main className="result-screen">
      <p className="result-kicker">Round result</p>
      <p className="result-word">The word was: {word}</p>
      <h1 className={correct ? 'result-banner result-banner-correct' : 'result-banner result-banner-wrong'}>
        {correct ? 'Correct! +1 point' : 'Nope, 0 points'}
      </h1>
      <section className="result-guesses">
        <h2 className="result-guesses-heading">AI guesses</h2>
        <ul className="result-guesses-list">
          {guesses.map((guess) => (
            <li key={guess}>{guess}</li>
          ))}
        </ul>
      </section>
      <button type="button" className="result-next" onClick={onNext}>
        Next
      </button>
    </main>
  )
}
