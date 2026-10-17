const mongoose = require('mongoose')

const scoreSchema = new mongoose.Schema({
  playerName: { type: String, required: true },
  points: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Score', scoreSchema)
