import { useEffect, useRef, useState } from 'react'
import { socket } from '../socket'
import HandDemo from '../HandDemo'
import './DrawScreen.css'

export default function MultiplayerDraw({ roundInfo, onResults }) {
  const [secondsLeft, setSecondsLeft] = useState(roundInfo.seconds)
  const [submitted, setSubmitted] = useState(false)
  const drawingRef = useRef(null)
  const submittedRef = useRef(false)

  function submit() {
    if (submittedRef.current) return
    submittedRef.current = true
    setSubmitted(true)
    const image = drawingRef.current ? drawingRef.current.getImage() : ''
    socket.emit('submit_drawing', image)
  }

  // countdown
  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // auto-submit when time is up
  useEffect(() => {
    if (secondsLeft === 0) submit()
  }, [secondsLeft])

  // results arrive from the server
  useEffect(() => {
    socket.on('round_results', onResults)
    return () => socket.off('round_results', onResults)
  }, [onResults])

  return (
    <main className="draw-screen">
      <p className="draw-round">
        Round {roundInfo.round} of {roundInfo.totalRounds}
      </p>
      <h1 className="draw-word">{roundInfo.word}</h1>
      <p className="draw-timer" aria-live="polite">
        {secondsLeft}s
      </p>
      <div className="draw-canvas-placeholder">
        <HandDemo ref={drawingRef} />
      </div>
      <button
        type="button"
        className="draw-done"
        onClick={submit}
        disabled={submitted}
      >
        {submitted ? 'Waiting for others...' : 'Done'}
      </button>
    </main>
  )
}