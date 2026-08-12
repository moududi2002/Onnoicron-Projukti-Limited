'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SocketContextType {
  isConnected: boolean;
  lastMessage: any;
  sendMessage: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000'}/ws?token=${token}`);
    
    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);
    socket.onmessage = (event) => setLastMessage(JSON.parse(event.data));
    
    setWs(socket);
    return () => socket.close();
  }, []);

  const sendMessage = (event: string, data: any) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event, data }));
    }
  };

  return (
    <SocketContext.Provider value={{ isConnected, lastMessage, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};