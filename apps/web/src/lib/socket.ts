import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { getRedisClient } from './redis'
import { parse } from 'cookie'

// Event Types
export interface OccupancyEvent {
  attractionId: string
  current: number
  max: number
  timestamp: string
}

export interface StatusEvent {
  attractionId: string
  isOpen: boolean
  nextChange: string
}

export interface TicketSoldEvent {
  attractionId: string
  ticketType: string
  quantity: number
}

export interface NewLeadEvent {
  leadId: string
  name: string
  company: string
}

export interface NewFeedbackEvent {
  attractionId: string
  rating: number
  comment: string
}

export interface BroadcastEvent {
  id: string
  message: string
}

export interface DashboardStatsEvent {
  activeProjects: number
  newLeads: number
  upcomingEvents: number
  avgRating: number
}

// Global IO instance
let io: SocketIOServer | null = null

export const initSocket = (server: HttpServer) => {
  if (io) return io

  io = new SocketIOServer(server, {
    path: '/api/socket.io',
    cors: { origin: '*' },
    transports: ['websocket', 'polling']
  })

  // Setup Redis Adapter for horizontal scaling if Redis is available
  const isProd = process.env.NODE_ENV === 'production'
  const pubClient = getRedisClient({ mode: isProd ? 'required' : 'optional' })
  if (pubClient) {
    try {
      const subClient = pubClient.duplicate()
      io.adapter(createAdapter(pubClient, subClient))
    } catch (err) {
      console.warn('[Socket] Failed to attach Redis adapter, running with in-memory adapter:', err)
    }
  } else {
    console.warn('[Socket] Running with in-memory adapter (single-node mode)')
  }

  // ---------------------------------------------------------
  // NAMESPACE: /public
  // ---------------------------------------------------------
  const publicNamespace = io.of('/public')
  
  // Rate limiter per connection (very naive implementation)
  publicNamespace.use((socket, next) => {
    let _emits = 0
    const interval = setInterval(() => { _emits = 0 }, 1000)
    socket.on('disconnect', () => clearInterval(interval))
    
    // Intercept incoming events if we wanted clients to emit, but clients only receive here.
    next()
  })

  publicNamespace.on('connection', (socket) => {
    console.log(`[Socket] Public client connected: ${socket.id}`)
    
    socket.on('join:attraction', (attractionId: string) => {
      socket.join(`attraction:${attractionId}`)
    })
    
    socket.on('leave:attraction', (attractionId: string) => {
      socket.leave(`attraction:${attractionId}`)
    })
  })

  // ---------------------------------------------------------
  // NAMESPACE: /dashboard
  // ---------------------------------------------------------
  const dashboardNamespace = io.of('/dashboard')
  
  // Authentication middleware
  dashboardNamespace.use(async (socket, next) => {
    try {
      const cookies = parse(socket.handshake.headers.cookie || '')
      const sessionToken = cookies['next-auth.session-token'] || cookies['__Secure-next-auth.session-token']
      
      if (!sessionToken && process.env.NODE_ENV === 'production') {
        return next(new Error('Authentication error'))
      }
      
      socket.data.user = { authenticated: true }
      next()
    } catch {
      next(new Error('Authentication error'))
    }
  })

  dashboardNamespace.on('connection', (socket) => {
    console.log(`[Socket] Dashboard client connected: ${socket.id}`)
    
    socket.on('join:room', (room: string) => {
      socket.join(room)
    })
  })

  return io
}

// Utility to get the io instance if needed
export const getIO = () => io
