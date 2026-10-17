const express = require('express')
const Word = require('../models/Word')
const Score = require('../models/Score')

const router = express.Router()

router.get('/api/categories', async (_req, res) => {
  try {
    const categories = await Word.distinct('category')
    res.json({ categories: categories.sort() })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load categories' })
  }
})

router.get('/api/word', async (req, res) => {
  try {
    const { category, exclude } = req.query
    const filter = {}

    if (category && category !== 'random') {
      filter.category = category
    }

    if (exclude) {
      filter.text = { $nin: String(exclude).split(',').map((item) => item.trim()).filter(Boolean) }
    }

    const matches = await Word.find(filter)
    if (matches.length === 0) {
      return res.status(404).json({ error: 'No word found' })
    }

    const word = matches[Math.floor(Math.random() * matches.length)]
    res.json({ text: word.text, category: word.category })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load word' })
  }
})

router.post('/api/score', async (req, res) => {
  try {
    const { playerName, points } = req.body
    if (!playerName || points == null) {
      return res.status(400).json({ error: 'playerName and points are required' })
    }

    const score = await Score.create({ playerName, points })
    res.json(score)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save score' })
  }
})

router.get('/api/leaderboard', async (_req, res) => {
  try {
    const scores = await Score.find().sort({ points: -1, createdAt: 1 }).limit(10)
    res.json({ scores })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load leaderboard' })
  }
})

module.exports = router
