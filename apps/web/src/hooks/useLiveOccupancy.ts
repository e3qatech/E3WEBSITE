"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAttractionsStore } from '@/store/useAttractionsStore';

export function useLiveOccupancy() {
  const socketRef = useRef<Socket | null>(null);
  const updateOccupancy = useAttractionsStore((state) => state.updateOccupancy);

  useEffect(() => {
    // Only connect in browser environment
    if (typeof window === 'undefined') return;

    // Use environment variable for socket URL, fallback to empty string (same origin)
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || '';
    
    try {
      socketRef.current = io(socketUrl, {
        path: '/api/socket.io',
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: false,
        reconnectionAttempts: 1,
        timeout: 4000,
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('[LiveOccupancy] Connected to realtime server');
      });

      socket.on('occupancy:update', (data: { attractionId: string; currentCount: number; maxCapacity: number }) => {
        if (data && data.attractionId) {
          updateOccupancy(data.attractionId, data.currentCount, data.maxCapacity);
        }
      });

      socket.on('disconnect', () => {
        console.log('[LiveOccupancy] Disconnected');
      });

      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    } catch (e) {
      console.warn('[LiveOccupancy] Socket connection failed:', e);
    }
  }, [updateOccupancy]);
}
