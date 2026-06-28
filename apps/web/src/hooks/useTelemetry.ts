'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface OccupancyData {
  attractionId: string;
  current: number;
  max: number;
  timestamp: string;
}

let socketInstance: Socket | null = null;

export function useTelemetry(attractionId?: string) {
  const [occupancy, setOccupancy] = useState<Record<string, OccupancyData>>({});

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io('/public', {
        path: '/api/socket.io',
        transports: ['websocket', 'polling'],
      });
    }

    const socket = socketInstance;

    if (attractionId) {
      socket.emit('join:attraction', attractionId);
    }

    const handleUpdate = (data: OccupancyData) => {
      setOccupancy((prev) => ({
        ...prev,
        [data.attractionId]: data,
      }));
    };

    socket.on('occupancy:update', handleUpdate);

    return () => {
      socket.off('occupancy:update', handleUpdate);
      if (attractionId) {
        socket.emit('leave:attraction', attractionId);
      }
    };
  }, [attractionId]);

  // If attractionId is provided, return just that occupancy, else return the whole map
  return { 
    occupancy: attractionId ? occupancy[attractionId] : null,
    allOccupancy: occupancy
  };
}
