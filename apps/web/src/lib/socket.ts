import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { getRedisAdapterClients } from '@/lib/redis'
import { parse } from 'cookie'
// Assuming next-auth sets a cookie, but we can't easily decrypt it without the secret.
// For now, we will perform a basic check. In production, we'd use `getToken({ req, secret })`
// from next-auth/jwt if we passed a mock req object.

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

// Global IO instance so API routes can emit if they run in the same process
// Note: In serverless, this won't work, which is why Redis adapter is crucial.
// Serverless API routes would need to publish directly to Redis, and this custom server
// would subscribe.
let io: SocketIOServer | null = null

export const initSocket = (server: HttpServer) => {
  if (io) return io

  io = new SocketIOServer(server, {
    path: '/api/socket.io',
    cors: { origin: '*' },
    transports: ['websocket', 'polling']
  })

  // Setup Redis Adapter for horizontal scaling
  let socketState = 'disabled';
  try {
    // Explicit degradation policy for Socket.IO
    const adapterClients = getRedisAdapterClients();
    if (adapterClients) {
      io.adapter(createAdapter(adapterClients.pubClient, adapterClients.subClient));
      socketState = 'ready';
      console.log(`[Socket] Transitioning to state: ${socketState} (Redis Adapter bound)`);
    } else {
      if (process.env.NODE_ENV === 'production' && process.env.REDIS_DISABLED !== 'true') {
        socketState = 'failed';
        console.error(`[Socket] Transitioning to state: ${socketState} (Redis Adapter is missing in Production! Refusing to initialize Socket.IO to prevent split-brain)`);
        throw new Error('Redis Adapter required for Production Socket.IO');
      } else {
        socketState = 'degraded';
        console.log(`[Socket] Transitioning to state: ${socketState} (Running with in-memory adapter)`);
      }
    }
  } catch (error: any) {
    if (process.env.NODE_ENV === 'production') {
      socketState = 'unavailable';
      console.error(`[Socket] Transitioning to state: ${socketState} (Failed to initialize Redis Adapter in Production. Socket.IO disabled)`, error.message);
      // Disable the IO server by closing it or setting it to null to expose a controlled unavailable state
      io.close();
      io = null;
      return null;
    } else {
      socketState = 'degraded';
      console.warn(`[Socket] Transitioning to state: ${socketState} (Failed to initialize Redis Adapter, falling back to in-memory)`, error.message);
    }
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
      // The session token might be next-auth.session-token or __Secure-next-auth.session-token
      const sessionToken = cookies['next-auth.session-token'] || cookies['__Secure-next-auth.session-token']
      
      // We could use `getToken` from next-auth/jwt here if we construct a pseudo-request.
      // For this implementation, we just ensure a token exists.
      if (!sessionToken && process.env.NODE_ENV === 'production') {
        return next(new Error('Authentication error'))
      }
      
      // Optionally attach user info to socket
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
