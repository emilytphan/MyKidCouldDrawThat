import { useEffect, useState } from "react";
import { socket } from "./socket";

export default function SocketTest() {
  const [name, setName] = useState("Player" + Math.floor(Math.random() * 100));
  const [codeInput, setCodeInput] = useState("");
  const [lobby, setLobby] = useState(null);
  const [round, setRound] = useState(null);
  const [results, setResults] = useState(null);
  const [final, setFinal] = useState(null);
  const [error, setError] = useState("");
  const [myCode, setMyCode] = useState("");

  useEffect(() => {
    socket.on("lobby", setLobby);
    socket.on("round_start", (r) => {
      setRound(r);
      setResults(null);
    });
    socket.on("round_results", setResults);
    socket.on("game_over", setFinal);
    return () => {
      socket.off("lobby");
      socket.off("round_start");
      socket.off("round_results");
      socket.off("game_over");
    };
  }, []);

  function createRoom() {
    socket.emit("create_room", { name }, (res) => {
      if (res.ok) {
        setMyCode(res.code);
        setError("");
      } else {
        setError(res.error);
      }
    });
  }

  function joinRoom() {
    socket.emit("join_room", { code: codeInput, name }, (res) => {
      if (res.ok) {
        setMyCode(res.code);
        setError("");
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Socket test</h2>
      <p>Connected id: {socket.id || "connecting..."}</p>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="name"
      />
      <button onClick={createRoom}>Create room</button>

      <input
        value={codeInput}
        onChange={(e) => setCodeInput(e.target.value)}
        placeholder="room code"
      />
      <button onClick={joinRoom}>Join</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {myCode && <h3>Room code: {myCode}</h3>}

      {lobby && (
        <div>
          <h3>Lobby</h3>
          <ul>
            {lobby.players.map((p) => (
              <li key={p.id}>
                {p.name} ({p.score})
              </li>
            ))}
          </ul>
          {lobby.hostId === socket.id && !round && (
            <button onClick={() => socket.emit("start_game")}>Start game</button>
          )}
        </div>
      )}

      {round && !final && (
        <div>
          <h3>
            Round {round.round}/{round.totalRounds}: draw "{round.word}"
          </h3>
          <button onClick={() => socket.emit("submit_drawing", "fake-image")}>
            Submit fake drawing
          </button>
        </div>
      )}

      {results && <pre>{JSON.stringify(results, null, 2)}</pre>}
      {final && <pre>FINAL: {JSON.stringify(final, null, 2)}</pre>}
    </div>
  );
}