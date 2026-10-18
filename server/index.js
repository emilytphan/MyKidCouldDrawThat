require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sharp = require("sharp");
const { GoogleGenAI } = require("@google/genai");
const connectDB = require("./db");
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use("/api", require("./routes/game"));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const normalize = (s) =>
  s.toLowerCase().trim().replace(/[^a-z\s]/g, "").replace(/s$/, "");

function floorAccuracy(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return 0;
  return Math.min(10, Math.max(0, n));
}

app.post("/api/guess", async (req, res) => {
  const { imageBase64, targetWord } = req.body;
  if (!imageBase64) return res.status(400).json({ error: "No image" });

  try {
    // Strip a "data:image/...;base64," prefix if present
    const raw = imageBase64.replace(/^data:image\/[\w+.-]+;base64,/, "");

    // Convert any image format to a PNG on a white background
    const png = await sharp(Buffer.from(raw, "base64"))
      .flatten({ background: "#ffffff" })
      .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { inlineData: { mimeType: "image/png", data: png.toString("base64") } },
        {
          text:
            "This is a hand-drawn sketch from a drawing game. " +
            (targetWord
              ? `The secret word is "${targetWord}". Grade how clearly the sketch depicts that word. `
              : "What is it? Grade how recognizable the sketch is. ") +
            "Reply with JSON only, no other text: " +
            '{"guesses": ["...", "...", "..."], "accuracy": 0, "comment": "one short funny remark"}. ' +
            "Guesses are single common nouns, ranked by confidence. " +
            "accuracy is a number from 0 (unrecognizable) to 10 (clear). Decimals are allowed; the server will round down.",
        },
      ],
      config: { responseMimeType: "application/json" },
    });

    const text = response.text || "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    const guesses = parsed.guesses || [];
    const accuracy = floorAccuracy(parsed.accuracy);
    const correct = targetWord
      ? guesses.some((g) => normalize(g) === normalize(targetWord))
      : false;

    res.json({ guesses, comment: parsed.comment, correct, accuracy });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message || "Guess failed",
      guesses: [],
      correct: false,
      accuracy: 0,
    });
  }
});

app.listen(3001, () => console.log("Server on 3001"));
