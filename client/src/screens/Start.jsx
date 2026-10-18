import './Start.css'
import HandDemo from '../HandDemo'

export default function Start({ onPlay, onMultiplayer }) {
  return (
    <main className="start-page">
      <p className="start-kicker">A drawing guessing game</p>
      <h1>My Kid Could Draw That</h1>
      <p className="start-lead">
        Play this game by drawing with your finger. Then the AI will guess what
        you have drawn. If the AI guesses correctly, you get one point.
      </p>

      <section className="start-howto" aria-labelledby="howto-heading">
        <h2 id="howto-heading">How to play</h2>

        <h3>Solo</h3>
        <ol>
          <li>Pick a category (animals, food, objects, or nature).</li>
          <li>Draw the word with your finger in front of the camera.</li>
          <li>The AI guesses your drawing. A correct guess is worth 1 point.</li>
          <li>Play 5 rounds, then see your score.</li>
        </ol>

        <h3>Multiplayer</h3>
        <ol>
          <li>One player taps Multiplayer, enters a name, and creates a room.</li>
          <li>Share the 4-letter room code. Friends join from their own device (everyone needs a camera).</li>
          <li>The host starts the game. Everyone gets the same word and timer at the same time.</li>
          <li>Everyone draws at once. The AI scores each drawing out of 10 for how well it matches the word.</li>
          <li>Points add up over 3 rounds, and the player with the most points tops the leaderboard.</li>
        </ol>
      </section>

      <section className="start-gestures" aria-labelledby="gestures-heading">
        <h2 id="gestures-heading">Hand gestures</h2>
        <ul className="start-gesture-list">
          <li>
            <span className="start-gesture-icon" aria-hidden="true">☝️</span>
            <div>
              <strong>Pointer finger up</strong>
              <p>Draw</p>
            </div>
          </li>
          <li>
            <span className="start-gesture-icon" aria-hidden="true">✌️</span>
            <div>
              <strong>Peace sign</strong>
              <p>Idle — no drawing or erasing</p>
            </div>
          </li>
          <li>
            <span className="start-gesture-icon" aria-hidden="true">✊</span>
            <div>
              <strong>Fist toward the camera</strong>
              <p>Eraser</p>
            </div>
          </li>
          <li>
            <span className="start-gesture-icon" aria-hidden="true">🖐️</span>
            <div>
              <strong>Open palm</strong>
              <p>Open the color wheel and choose a color</p>
            </div>
          </li>
        </ul>
      </section>

      <section className="start-demo" aria-labelledby="demo-heading">
        <h2 id="demo-heading">Try it with your hand</h2>
        <p>
          Point to draw, make a peace sign to pause, make a fist to erase, and
          open your palm for the color wheel.
        </p>
        <HandDemo />
      </section>

      <div className="start-mode-buttons">
        <button type="button" className="start-play" onClick={onPlay}>
          Solo
        </button>
        {onMultiplayer && (
          <button type="button" className="start-play" onClick={onMultiplayer}>
            Multiplayer
          </button>
        )}
      </div>
    </main>
  )
}