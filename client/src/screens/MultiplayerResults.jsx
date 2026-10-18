import './ResultScreen.css'

export default function MultiplayerResults({ data, final, onExit }) {
  if (final) {
    return (
      <main className="result-screen">
        <p className="result-kicker">Game over</p>
        <h1 className="result-banner result-banner-correct">Final standings</h1>
        <section className="result-guesses">
          <h2 className="result-guesses-heading">Leaderboard</h2>
          <ul className="result-guesses-list">
            {final.standings.map((p, i) => (
              <li key={p.id}>
                {i === 0 ? '🏆 ' : `${i + 1}. `}
                {p.name}: {p.score} points
              </li>
            ))}
          </ul>
        </section>
        <button type="button" className="result-next" onClick={onExit}>
          Back to start
        </button>
      </main>
    )
  }

  const standings = [...data.standings].sort((a, b) => b.score - a.score)

  return (
    <main className="result-screen">
      <p className="result-kicker">Round result</p>
      <p className="result-word">The word was: {data.word}</p>

      <section className="result-guesses">
        <h2 className="result-guesses-heading">How everyone did</h2>
        <ul className="result-guesses-list">
          {data.results.map((r) => (
            <li key={r.id}>
              <strong>{r.name}</strong>: {r.accuracy}/10 (+{r.points} pts). AI
              guessed "{r.guess}"
              {r.comment ? ` — ${r.comment}` : ''}
            </li>
          ))}
        </ul>
      </section>

      <section className="result-guesses">
        <h2 className="result-guesses-heading">Standings</h2>
        <ul className="result-guesses-list">
          {standings.map((p) => (
            <li key={p.id}>
              {p.name}: {p.score}
            </li>
          ))}
        </ul>
      </section>

      <p>Next round starting soon...</p>
    </main>
  )
} 