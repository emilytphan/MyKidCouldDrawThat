import './FinalScreen.css'

export default function FinalScreen({ score, totalRounds, onPlayAgain }) {
  return (
    <main className="final-screen">
      <p className="final-kicker">Game over</p>
      <h1 className="final-score">
        You scored {score} out of {totalRounds}
      </h1>
      <div className="final-leaderboard">Leaderboard coming soon</div>
      <button type="button" className="final-play-again" onClick={onPlayAgain}>
        Play Again
      </button>
    </main>
  )
}
