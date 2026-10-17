import { useEffect, useRef, useState } from 'react'
import './DrawScreen.css'
import HandDemo from '../HandDemo'

export default function DrawScreen({ word, round, totalRounds, onFinish }) {
  const [secondsLeft, setSecondsLeft] = useState(60)
  const finishedRef = useRef(false)
  const drawingRef = useRef(null)

  function finish() {
    if (finishedRef.current) return
    finishedRef.current = true
    const image = drawingRef.current
      ? drawingRef.current.getImage()
      : 'fake-image'
    onFinish(image)
  }

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(id)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (secondsLeft === 0) {
      finish()
    }
  }, [secondsLeft])

  return (
    <main className="draw-screen">
      <p className="draw-round">
        Round {round} of {totalRounds}
      </p>
      <h1 className="draw-word">{word}</h1>
      <p className="draw-timer" aria-live="polite">
        {secondsLeft}s
      </p>
      <div className="draw-canvas-placeholder">
        <HandDemo ref={drawingRef} />
      </div>
      <button type="button" className="draw-done" onClick={finish}>
        Done
      </button>
    </main>
  )
}