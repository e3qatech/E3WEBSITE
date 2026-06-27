const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // We require the socket initializer from the compiled build (or tsx in dev).
  // For a seamless dev experience without pre-compiling TS, we can use require('ts-node/register') or similar if needed.
  // Assuming the user runs this file in a production environment via Node, or we can just mock it for now.
  try {
    // In a real TS setup, you'd compile src/lib/socket.ts or use tsx.
    // We'll mock the import here to avoid complex ts-node setup for this demo.
    const { initSocket } = require('./.next/server/app/api/socket.js') // Fallback path mapping or compiled
    initSocket(server)
  } catch(e) {
    console.warn("Could not load socket initializer, attempting ts-node fallback or ignoring...")
    try {
      require('ts-node').register({ transpileOnly: true })
      const { initSocket } = require('./src/lib/socket.ts')
      initSocket(server)
      console.log('> Socket.io attached via ts-node')
    } catch(err) {
      console.log('> Running Next.js server without Socket.io attached (build error)')
    }
  }

  server.once('error', (err) => {
    console.error(err)
    process.exit(1)
  })

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
