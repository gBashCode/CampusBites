import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import API_URL from '../apiConfig';

const WebSocketContext = createContext();

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const { token } = useAuth();
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState([]);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = API_URL.replace(/^http/, 'ws') + `?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => {
      setIsConnected(false);
      reconnectTimeout.current = setTimeout(connect, 5000);
    };
    ws.onerror = () => ws.close();
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ORDER_STATUS_UPDATED') {
          setOrderUpdates(prev => [data, ...prev].slice(0, 50));
        }
      } catch { }
    };
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const clearOrderUpdates = () => setOrderUpdates([]);

  return (
    <WebSocketContext.Provider value={{ isConnected, orderUpdates, clearOrderUpdates }}>
      {children}
    </WebSocketContext.Provider>
  );
};
