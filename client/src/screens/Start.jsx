import './Start.css'
import HandDemo from '../HandDemo'

export default function Start({ onPlay }) {
  return (
    <main className="start-page">
      <p className="start-kicker">A drawing guessing game</p>
      <h1>My Kid Could Draw That</h1>
      <p className="start-lead">
        Draw a word. The AI tries to guess it. You get 1 point if it is right.
      </p>

      <section className="start-howto" aria-labelledby="howto-heading">
        <h2 id="howto-heading">How to play</h2>
        <ol>
          <li>Pick a category (animals, food, objects, or nature).</li>
          <li>You get 60 seconds to draw the word.</li>
          <li>The AI makes a guess. Right = 1 point, wrong = 0.</li>
          <li>Play 5 rounds, then see your score.</li>
        </ol>
      </section>

      <section className="start-demo" aria-labelledby="demo-heading">
        <h2 id="demo-heading">Try it with your hand</h2>
        <p>
          Point to draw, make a fist to erase, pinch and spread to change the
          brush size.
        </p>
        <HandDemo />
      </section>

      <button type="button" className="start-play" onClick={onPlay}>
        Play
      </button>
    </main>
  )
}