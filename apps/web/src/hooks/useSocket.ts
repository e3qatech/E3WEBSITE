"use client"

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import type { 
  OccupancyEvent, 
  StatusEvent, 
  DashboardStatsEvent, 
  NewLeadEvent, 
  TicketSoldEvent, 
  NewFeedbackEvent, 
  BroadcastEvent 
} from '@/lib/socket'

// Base hook for connecting to a namespace
export function useSocket(namespace: string) {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    // Socket.io automatically handles exponential backoff and reconnection
    const socketInstance = io(namespace, {
      path: '/api/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true, // Important for sending NextAuth cookies during handshake
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [namespace])

  return socket
}

// ---------------------------------------------------------
// DOMAIN HOOKS
// ---------------------------------------------------------

export function useAttractionOccupancy(attractionId: string) {
  const socket = useSocket('/public')
  const [occupancy, setOccupancy] = useState<OccupancyEvent | null>(null)
  const [isOpen, setIsOpen] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!socket) return

    const handleConnect = () => {
      setIsConnected(true)
      socket.emit('join:attraction', attractionId)
    }

    const handleDisconnect = () => setIsConnected(false)

    const handleOccupancy = (data: OccupancyEvent) => {
      if (data.attractionId === attractionId) {
        setOccupancy(data)
      }
    }

    const handleStatus = (data: StatusEvent) => {
      if (data.attractionId === attractionId) {
        setIsOpen(data.isOpen)
      }
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('attraction:occupancy', handleOccupancy)
    socket.on('attraction:status', handleStatus)

    if (socket.connected) {
      handleConnect()
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('attraction:occupancy', handleOccupancy)
      socket.off('attraction:status', handleStatus)
      if (socket.connected) socket.emit('leave:attraction', attractionId)
    }
  }, [socket, attractionId])

  return {
    ...occupancy,
    percentage: occupancy ? (occupancy.current / occupancy.max) * 100 : 0,
    isOpen,
    isConnected,
  }
}

// Feed item type
export type FeedItem = {
  id: string
  type: 'lead' | 'ticket' | 'feedback' | 'broadcast'
  timestamp: Date
  data: any
}

export function useDashboardFeed(initialItems: FeedItem[] = []) {
  const socket = useSocket('/dashboard')
  const [feed, setFeed] = useState<FeedItem[]>(initialItems)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!socket) return

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    const addFeedItem = (type: FeedItem['type'], data: any) => {
      setFeed(prev => {
        const newItem: FeedItem = { id: crypto.randomUUID(), type, timestamp: new Date(), data }
        const next = [newItem, ...prev]
        return next.slice(0, 50) // Max 50 items
      })
    }

    const handleLead = (data: NewLeadEvent) => addFeedItem('lead', data)
    const handleTicket = (data: TicketSoldEvent) => addFeedItem('ticket', data)
    const handleFeedback = (data: NewFeedbackEvent) => addFeedItem('feedback', data)
    const handleBroadcast = (data: BroadcastEvent) => addFeedItem('broadcast', data)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('lead:new', handleLead)
    socket.on('ticket:sold', handleTicket)
    socket.on('feedback:new', handleFeedback)
    socket.on('broadcast:active', handleBroadcast)

    if (socket.connected) handleConnect()

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('lead:new', handleLead)
      socket.off('ticket:sold', handleTicket)
      socket.off('feedback:new', handleFeedback)
      socket.off('broadcast:active', handleBroadcast)
    }
  }, [socket])

  return { feed, isConnected }
}

export function useLiveStats() {
  const socket = useSocket('/dashboard')
  const [stats, setStats] = useState<DashboardStatsEvent | null>(null)

  useEffect(() => {
    if (!socket) return

    const handleStats = (data: DashboardStatsEvent) => {
      setStats(data)
    }

    socket.on('dashboard:stats', handleStats)

    return () => {
      socket.off('dashboard:stats', handleStats)
    }
  }, [socket])

  return stats
}
