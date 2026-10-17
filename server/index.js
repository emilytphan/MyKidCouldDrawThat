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
