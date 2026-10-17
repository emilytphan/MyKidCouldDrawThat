import { useEffect, useRef } from 'react'
import './Start.css'

export default function Start({ onPlay }) {
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
  }, [])

  function pointFromEvent(event) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  function handlePointerDown(event) {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = pointFromEvent(event)

    drawingRef.current = true
    canvas.setPointerCapture(event.pointerId)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 5
    ctx.strokeStyle = '#08060d'
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function handlePointerMove(event) {
    if (!drawingRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = pointFromEvent(event)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function handlePointerUp() {
    drawingRef.current = false
  }

  function clearDemo() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

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
        <h2 id="demo-heading">Try a mouse demo</h2>
        <p>
          Hold the mouse button and drag to draw. Later, Role 1&apos;s hand
          tracking will replace this mouse stand-in.
        </p>
        <canvas
          ref={canvasRef}
          className="start-demo-canvas"
          aria-label="Mouse drawing demo"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        <button type="button" className="start-secondary" onClick={clearDemo}>
          Clear demo
        </button>
      </section>

      <button type="button" className="start-play" onClick={onPlay}>
        Play
      </button>
    </main>
  )
}
