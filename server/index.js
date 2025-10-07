import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

app.use(express.json({ limit: '10mb' }))
app.use(express.static('dist'))

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

// Broadcast to all connected clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify({ type: 'dataUpdate', data }))
    }
  })
}

app.get('/api/data', (req, res) => {
  const db = readDb()
  res.json(db)
})

app.put('/api/data', (req, res) => {
  const incoming = req.body
  const updated = { data: incoming, updatedAt: Date.now() }
  writeDb(updated)
  broadcast(incoming) // Real-time update to all clients
  res.json(updated)
})

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected')
  
  // Send current data to new client
  const db = readDb()
  if (db.data) {
    ws.send(JSON.stringify({ type: 'dataUpdate', data: db.data }))
  }
  
  ws.on('close', () => {
    console.log('Client disconnected')
  })
})

// Serve React app for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const PORT = process.env.PORT || 3000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`)
  console.log(`WebSocket server ready for real-time updates`)
})


