require('dotenv').config()
const mongoose = require('mongoose')
const connectDb = require('./db')
const Word = require('./models/Word')
const words = require('./seed-data')

async function seed() {
  await connectDb()
  await Word.deleteMany({})
  const inserted = await Word.insertMany(words)
  console.log(`Seeded ${inserted.length} words`)
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
