require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
const connectDb = require("./db");
connectDb();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(require("./routes/game"));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const normalize = (s) =>
  s.toLowerCase().trim().replace(/[^a-z\s]/g, "").replace(/s$/, "");

app.post("/api/guess", async (req, res) => {
  const { imageBase64, targetWord } = req.body;
  if (!imageBase64) return res.status(400).json({ error: "No image" });

  const data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { inlineData: { mimeType: "image/png", data } },
        {
          text:
            "This is a hand-drawn sketch from a drawing game. What is it? " +
            "Reply with JSON only, no other text: " +
            '{"guesses": ["...", "...", "..."], "comment": "one short funny remark"}. ' +
            "Guesses are single common nouns, ranked by confidence.",
        },
      ],
      config: { responseMimeType: "application/json" },
    });

    const text = response.text || "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    const guesses = parsed.guesses || [];
    const correct = targetWord
      ? guesses.some((g) => normalize(g) === normalize(targetWord))
      : false;

    res.json({ guesses, comment: parsed.comment, correct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Guess failed", guesses: [], correct: false });
  }
});

app.listen(3001, () => console.log("Server on 3001"));
