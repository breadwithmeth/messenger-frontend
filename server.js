import { createServer } from 'http'
import { createReadStream } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const PORT = process.env.PORT || 3001

const server = createServer((req, res) => {
  // Serve static files from dist directory
  let filePath = join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url)
  
  // Handle client-side routing by serving index.html for non-file requests
  if (!req.url.includes('.')) {
    filePath = join(__dirname, 'dist', 'index.html')
  }

  const ext = filePath.split('.').pop()
  const contentTypes = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon'
  }

  const stream = createReadStream(filePath)

  stream.on('error', () => {
    res.writeHead(404)
    res.end('Not found')
  })

  res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' })
  stream.pipe(res)
})

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
