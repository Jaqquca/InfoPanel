import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json({ limit: '10mb' }))

const DB_PATH = path.join(__dirname, 'db.json')

function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8')
    return JSON.parse(raw)
  } catch {
    return { data: null, updatedAt: 0 }
  }
}

function writeDb(obj) {
  fs.writeFileSync(DB_PATH, JSON.stringify(obj))
}

app.get('/api/data', (req, res) => {
  const db = readDb()
  res.json(db)
})

app.put('/api/data', (req, res) => {
  const incoming = req.body
  const updated = { data: incoming, updatedAt: Date.now() }
  writeDb(updated)
  res.json(updated)
})

const PORT = process.env.PORT || 5174
app.listen(PORT, () => {
  console.log(`API server listening on http://0.0.0.0:${PORT}`)
})


