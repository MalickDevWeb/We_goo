import { useEffect, useState } from 'react';

/**
 * A robust simulated WebSocket service that perfectly mimics real socket.io / native WebSocket behavior.
 * This can easily be swapped with a real `io('wss://...')` or `new WebSocket('wss://...')` later.
 */
class SocketService {
  private listeners: Record<string, Function[]> = {};
  private activeIntervals: number[] = [];

  constructor() {
    console.log('[WebSocket] Initializing Super-App real-time connection...');
    // Simulate connection delay
    setTimeout(() => {
      console.log('[WebSocket] Connected successfully (WSS/TLS)');
      this.dispatchEvent('connection', { status: 'connected' });
      this.startSimulatingEvents();
    }, 1500);
  }

  // --- Core WebSocket API ---
  
  on(event: string, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, data: any) {
    console.log(`[WebSocket] Emit: ${event}`, data);
    // In a real app, this sends data to the server.
    // For local dev, we sometimes echo it back or bounce it.
    
    if (event === 'send_message') {
      // Simulate server receiving message and broadcasting to receiver
      setTimeout(() => {
        this.dispatchEvent('receive_message', {
          id: Date.now(),
          ...data,
          status: 'delivered'
        });
      }, 300);
    }

    if (event === 'simulate_driver_arrival') {
       this.dispatchEvent('driver_arrived', {
          id: data.id || 'DEMO-123',
          driverName: 'Mamadou Diallo',
          message: 'Votre chauffeur est arrivé à destination !'
       });
    }
  }

  private dispatchEvent(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  // --- Real-time Simulation Engine ---
  
  private startSimulatingEvents() {
    // 1. Simulate Driver GPS Location Updates (Fires every 3 seconds)
    const gpsInterval = setInterval(() => {
      this.dispatchEvent('driver_location_update', {
         lat: 14.6928 + (Math.random() * 0.002 - 0.001), 
         lng: -17.4467 + (Math.random() * 0.002 - 0.001),
         heading: Math.floor(Math.random() * 360),
         speed: Math.floor(Math.random() * 60)
      });
    }, 3000) as unknown as number;

    // 2. Simulate Incoming Ride/Delivery Requests for Driver Dashboard (Fires occasionally)
    const requestInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const types = ['ride', 'package', 'restaurant'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        this.dispatchEvent('new_request_incoming', {
          id: Date.now(),
          type: randomType,
          from: 'Aéroport DKR',
          to: 'Plateau',
          amount: Math.floor(Math.random() * 5000) + 1500,
          eta: Math.floor(Math.random() * 10) + 2
        });
      }
    }, 8000) as unknown as number;

    // 3. Simulate Incoming Restaurant Orders (Fires occasionally)
    const orderInterval = setInterval(() => {
       if (Math.random() > 0.8) {
          this.dispatchEvent('new_restaurant_order', {
             id: `ORD-${Date.now().toString().slice(-4)}`,
             items: ['Pizza Margherita', 'Coca Cola'],
             total: 9500,
             status: 'pending',
             customerName: 'Client Aléatoire'
          });
       }
    }, 10000) as unknown as number;

    this.activeIntervals.push(gpsInterval, requestInterval, orderInterval);
  }

  disconnect() {
    console.log('[WebSocket] Disconnected');
    this.activeIntervals.forEach(clearInterval);
  }
}

// Singleton instances
export const socketProvider = new SocketService();

/**
 * Custom React Hook to cleanly subscribe to WebSocket events
 */
export const useSocket = (eventName: string, callback: (data: any) => void) => {
  useEffect(() => {
    socketProvider.on(eventName, callback);
    return () => {
      socketProvider.off(eventName, callback);
    };
  }, [eventName, callback]);
};
