import { useEffect, useState } from 'react'
import { socket } from '../socket'
import './Start.css'

export default function Lobby({ onBack, onRoundStart }) {
  const [name, setName] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [myCode, setMyCode] = useState('')
  const [lobby, setLobby] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    function handleLobby(data) {
      setLobby(data)
    }
    function handleRoundStart(data) {
      onRoundStart(data)
    }
    socket.on('lobby', handleLobby)
    socket.on('round_start', handleRoundStart)
    return () => {
      socket.off('lobby', handleLobby)
      socket.off('round_start', handleRoundStart)
    }
  }, [onRoundStart])

  const cleanName = name.trim() || 'Player'

  function createRoom() {
    socket.emit('create_room', { name: cleanName }, (res) => {
      if (res.ok) {
        setMyCode(res.code)
        setError('')
      } else {
        setError(res.error || 'Could not create room')
      }
    })
  }

  function joinRoom() {
    socket.emit('join_room', { code: codeInput, name: cleanName }, (res) => {
      if (res.ok) {
        setMyCode(res.code)
        setError('')
      } else {
        setError(res.error || 'Could not join room')
      }
    })
  }

  const isHost = lobby && lobby.hostId === socket.id

  return (
    <main className="start-page">
      <p className="start-kicker">Multiplayer</p>
      <h1>Lobby</h1>

      {!myCode && (
        <section className="start-howto">
          <h2>Your name</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a name"
            maxLength={16}
            style={{ font: 'inherit', padding: 8, width: '100%', boxSizing: 'border-box' }}
          />

          <h2 style={{ marginTop: 16 }}>Start a new room</h2>
          <button type="button" className="start-play" onClick={createRoom}>
            Create room
          </button>

          <h2 style={{ marginTop: 16 }}>Or join a friend</h2>
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="4-letter code"
            maxLength={4}
            style={{ font: 'inherit', padding: 8, width: '100%', boxSizing: 'border-box' }}
          />
          <button
            type="button"
            className="start-secondary"
            style={{ marginTop: 10 }}
            onClick={joinRoom}
          >
            Join room
          </button>
        </section>
      )}

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {myCode && (
        <section className="start-howto">
          <h2>Room code: {myCode}</h2>
          <p>Share this code with friends. Everyone needs a camera.</p>
          <h2>Players</h2>
          <ul>
            {lobby?.players.map((p) => (
              <li key={p.id}>
                {p.name}
                {p.id === lobby.hostId ? ' (host)' : ''}
              </li>
            ))}
          </ul>
          {isHost ? (
            <button
              type="button"
              className="start-play"
              disabled={!lobby || lobby.players.length < 2}
              onClick={() => socket.emit('start_game')}
            >
              {lobby && lobby.players.length < 2 ? 'Waiting for players...' : 'Start game'}
            </button>
          ) : (
            <p>Waiting for the host to start...</p>
          )}
        </section>
      )}

      <button type="button" className="start-secondary" onClick={onBack}>
        Back
      </button>
    </main>
  )
}