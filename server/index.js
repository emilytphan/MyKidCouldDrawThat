require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const client = new Anthropic();

const normalize = (s) =>
  s.toLowerCase().trim().replace(/[^a-z\s]/g, "").replace(/s$/, "");

app.post("/api/guess", async (req, res) => {
  const { imageBase64, targetWord } = req.body;
  if (!imageBase64) return res.status(400).json({ error: "No image" });

  const data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  try {
    const response = await client.messages.create(
      {
        model: "claude-haiku-5-5",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/png", data } },
              {
                type: "text",
                text:
                  "This is a hand-drawn sketch from a drawing game. What is it? " +
                  "Reply with JSON only, no other text: " +
                  '{"guesses": ["...", "...", "..."], "comment": "one short funny remark"}. ' +
                  "Guesses are single common nouns, ranked by confidence.",
              },
            ],
          },
        ],
      },
      { timeout: 15000 }
    );

    const text = response.content.find((b) => b.type === "text")?.text || "";
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