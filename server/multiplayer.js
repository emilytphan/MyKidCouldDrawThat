const { Server } = require("socket.io");

const ROUND_SECONDS = 60;
const TOTAL_ROUNDS = 3;
const WORDS = ["cat", "pizza", "house", "tree", "car", "book", "sun", "fish", "hat", "cup"];
const rooms = new Map();

const pickWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

// STUB: replace with a call to Lenny's /api/guess when it returns { score, guesses, comment }
async function scoreDrawing(image, word) {
  return { score: Math.floor(Math.random() * 11), guesses: ["(stub)"], comment: "" };
}

function makeCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code;
  do {
    code = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
  } while (rooms.has(code));
  return code;
}

const players = (room) =>
  [...room.players.entries()].map(([id, p]) => ({ id, name: p.name, score: p.score }));

function attach(httpServer) {
  const io = new Server(httpServer, { cors: { origin: "*" }, maxHttpBufferSize: 5e6 });

  function startRound(code) {
    const room = rooms.get(code);
    if (!room) return;
    if (room.round >= TOTAL_ROUNDS) return endGame(code);
    room.round += 1;
    room.word = pickWord();
    room.drawings = new Map();
    room.scoring = false;
    room.startedAt = Date.now();
    io.to(code).emit("round_start", {
      round: room.round,
      totalRounds: TOTAL_ROUNDS,
      word: room.word,
      seconds: ROUND_SECONDS,
    });
    clearTimeout(room.timer);
    room.timer = setTimeout(() => scoreRound(code), (ROUND_SECONDS + 3) * 1000);
  }

  async function scoreRound(code) {
    const room = rooms.get(code);
    if (!room || room.scoring) return;
    room.scoring = true;
    clearTimeout(room.timer);

    const results = await Promise.all(
      [...room.players.entries()].map(async ([id, p]) => {
        const d = room.drawings.get(id);
        if (!d) return { id, name: p.name, accuracy: 0, points: 0, guess: "(no drawing)" };
        try {
          const r = await scoreDrawing(d.image, room.word);
          const accuracy = Math.max(0, Math.min(10, Number(r.score) || 0));
          const points = accuracy * 10;
          p.score += points;
          return { id, name: p.name, accuracy, points, guess: r.guesses?.[0] || "?", comment: r.comment };
        } catch {
          return { id, name: p.name, accuracy: 0, points: 0, guess: "(AI error)" };
        }
      })
    );

    io.to(code).emit("round_results", { word: room.word, results, standings: players(room) });
    setTimeout(() => startRound(code), 6000);
  }

  function endGame(code) {
    const room = rooms.get(code);
    if (!room) return;
    const standings = players(room).sort((a, b) => b.score - a.score);
    io.to(code).emit("game_over", { standings });
    // TODO (Nini): save totals to the MongoDB leaderboard here
    rooms.delete(code);
  }

  io.on("connection", (socket) => {
    let myRoom = null;

    socket.on("create_room", ({ name }, cb) => {
      const code = makeCode();
      rooms.set(code, {
        players: new Map([[socket.id, { name, score: 0 }]]),
        hostId: socket.id,
        round: 0,
        drawings: new Map(),
        started: false,
      });
      socket.join(code);
      myRoom = code;
      cb({ ok: true, code });
      io.to(code).emit("lobby", { hostId: socket.id, players: players(rooms.get(code)) });
    });

    socket.on("join_room", ({ code, name }, cb) => {
      code = (code || "").toUpperCase().trim();
      const room = rooms.get(code);
      if (!room) return cb({ ok: false, error: "Room not found" });
      if (room.started) return cb({ ok: false, error: "Game already started" });
      room.players.set(socket.id, { name, score: 0 });
      socket.join(code);
      myRoom = code;
      cb({ ok: true, code });
      io.to(code).emit("lobby", { hostId: room.hostId, players: players(room) });
    });

    socket.on("start_game", () => {
      const room = rooms.get(myRoom);
      if (!room || room.hostId !== socket.id) return;
      room.started = true;
      startRound(myRoom);
    });

    socket.on("submit_drawing", (image) => {
      const room = rooms.get(myRoom);
      if (!room || !room.started) return;
      room.drawings.set(socket.id, { image, at: Date.now() });
      if (room.drawings.size === room.players.size) scoreRound(myRoom);
    });

    socket.on("disconnect", () => {
      const room = rooms.get(myRoom);
      if (!room) return;
      room.players.delete(socket.id);
      if (room.players.size === 0) {
        clearTimeout(room.timer);
        rooms.delete(myRoom);
      } else {
        io.to(myRoom).emit("lobby", { hostId: room.hostId, players: players(room) });
      }
    });
  });
}

module.exports = { attach };