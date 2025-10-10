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
app.use(express.static(path.join(__dirname, '..', 'dist')))

const DB_PATH = path.join(__dirname, 'db.json')

function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8')
    console.log('Reading db.json from:', DB_PATH)
    console.log('Raw content:', raw)
    const parsed = JSON.parse(raw)
    console.log('Parsed successfully:', parsed)
    return parsed
  } catch (error) {
    console.error('Error reading db.json:', error.message)
    console.error('DB_PATH:', DB_PATH)
    console.error('File exists?', fs.existsSync(DB_PATH))
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
  try {
    const db = readDb()
    console.log('GET /api/data - returning data:', db)
    res.json(db)
  } catch (error) {
    console.error('Error in GET /api/data:', error)
    res.status(500).json({ error: 'Failed to read data', details: error.message })
  }
})

app.put('/api/data', (req, res) => {
  try {
    const incoming = req.body
    const updated = { data: incoming, updatedAt: Date.now() }
    writeDb(updated)
    broadcast(incoming) // Real-time update to all clients
    console.log('PUT /api/data - updated data:', incoming)
    res.json(updated)
  } catch (error) {
    console.error('Error in PUT /api/data:', error)
    res.status(500).json({ error: 'Failed to save data', details: error.message })
  }
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

// Serve React app for all routes (catch-all for SPA routing)
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html')
  console.log('Serving React app from:', indexPath)
  res.sendFile(indexPath)
})
app.get('/admin', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html')
  console.log('Serving React app from:', indexPath)
  res.sendFile(indexPath)
})

const PORT = process.env.PORT || 3000

// Check if dist folder exists
const distPath = path.join(__dirname, '..', 'dist')
if (!fs.existsSync(distPath)) {
  console.error('ERROR: dist folder not found at:', distPath)
  console.error('Please run: npm run build')
  process.exit(1)
}

// Check if dist/index.html exists
const indexPath = path.join(distPath, 'index.html')
if (!fs.existsSync(indexPath)) {
  console.error('ERROR: dist/index.html not found at:', indexPath)
  console.error('Please run: npm run build')
  process.exit(1)
}

console.log('✅ dist folder found at:', distPath)
console.log('✅ index.html found at:', indexPath)

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on http://0.0.0.0:${PORT}`)
  console.log(`🔌 WebSocket server ready for real-time updates`)
  console.log(`📁 Serving static files from: ${distPath}`)
})


