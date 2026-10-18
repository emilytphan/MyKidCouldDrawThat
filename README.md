# My Kid Could Draw That

A drawing game you play with your hand. The webcam watches your gestures, you draw the secret word, and Gemini scores the sketch from 0 to 10.

You need [Node.js](https://nodejs.org/), a webcam, a [Gemini API key](https://aistudio.google.com/apikey), and a MongoDB connection string.

## Setup

From the project folder, install both apps:

```bash
cd server
npm install
cd ../client
npm install
```

In `server/`, create a file named `.env`:

```bash
GEMINI_API_KEY=your_key_here
MONGODB_URI=your_mongodb_connection_string
```

Load the solo word list into that database (once):

```bash
cd server
node seed.js
```

## Run

Use two terminals and leave both of them open.

Terminal 1, the game server:

```bash
cd server
node index.js
```

Wait until it prints `Server on 3001` and `Mongo connected`.

Terminal 2, the website:

```bash
cd client
npm run dev
```

Open http://localhost:5173/ and allow the camera when the browser asks. Drawing only works on `localhost` (or `https`) because browsers block the camera on other addresses.

## How to draw

- Pointer finger: draw
- Peace sign: pause
- Fist: erase
- Open palm: color wheel

Click **Solo**, pick a category, and draw the word. If the word API is down, solo falls back to a word list saved in the app.

## Multiplayer (work in progress)

Multiplayer only works on the computer that is running the server. Rooms live in that server’s memory, so a code created on your laptop does not exist on anyone else’s.

To play together, open http://localhost:5173/ in two browser windows on that same computer:

1. In both windows, click **Multiplayer** and enter a name.
2. In one window, click **Create room** and copy the 4-letter code.
3. In the other window, paste the code and click **Join room**.
4. When both names are listed, the host’s button changes to **Start game**.

Both players get the same word and timer. The server scores each drawing and keeps the points. This is still a work in progress. Playing from a second device is not supported yet.

The free Gemini key has a small daily limit. When it runs out, guesses show up as "(AI error)" until the limit resets.
