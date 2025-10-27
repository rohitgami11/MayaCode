"use client";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Toast from 'react-native-toast-message';

interface SocketProviderProps {
  children?: React.ReactNode;
}

interface ISocketContext {
  sendMessage: (msg: string) => any;
  messages: string[];
  connectSocket: () => void;
  disconnectSocket: () => void;
  notifications: { message: string; timestamp: string }[];
  clearNotifications: () => void;
  connectionStatus: string;
}

export const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw new Error(`state is undefined`);

  return state;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<{ message: string; timestamp: string }[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const isActiveRef = React.useRef(true); // Track if app is active

  const connectSocket = useCallback(() => {
    if (!socket) {
      const socketURL = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8000';
      console.log("[Socket] Connecting to:", socketURL);
      const _socket = io(socketURL, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      _socket.on("connect", () => {
        console.log("[Socket] Connected");
        setConnectionStatus('connected');
      });
      _socket.on("disconnect", (reason) => {
        console.log("[Socket] Disconnected", reason);
        setConnectionStatus('disconnected');
      });
      _socket.on("reconnect_attempt", (attempt) => {
        console.log("[Socket] Reconnecting, attempt", attempt);
        setConnectionStatus('reconnecting');
      });
      _socket.on("error", (err) => {
        console.log("[Socket] Error", err);
        console.error("Full socket error details:", {
          message: err?.message,
          description: (err as any)?.description,
          context: (err as any)?.context,
          type: (err as any)?.type,
          transport: (err as any)?.transport,
          url: process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8000'
        });
        setConnectionStatus('error');
        if (Toast && Toast.show) {
          Toast.show({ type: 'error', text1: 'Socket Error', text2: err?.message || String(err) });
        }
      });
      _socket.on("connect_error", (err) => {
        console.log("[Socket] Connect Error", err);
        console.error("Full socket connect error details:", {
          message: err?.message,
          description: (err as any)?.description,
          context: (err as any)?.context,
          type: (err as any)?.type,
          transport: (err as any)?.transport,
          url: process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8000'
        });
        setConnectionStatus('error');
        if (Toast && Toast.show) {
          Toast.show({ type: 'error', text1: 'Socket Connect Error', text2: err?.message || String(err) });
        }
      });
      _socket.on("chat:receive", (data) => {
        setMessages((prev) => [...prev, data.message]);
      });
      _socket.on("message:delivered", (data) => {
        console.log("Received message:delivered", data);
        setNotifications((prev) => [data, ...prev]);
      });
      setSocket(_socket);
    } else {
      // If socket exists but is not connected, and app is active, reconnect
      if (socket && socket.disconnected && isActiveRef.current) {
        socket.io.opts.autoConnect = true;
        socket.connect();
      }
    }
    isActiveRef.current = true;
  }, [socket]);

  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.off("chat:receive");
      socket.off("message:delivered");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("reconnect_attempt");
      socket.off("error");
      // Prevent auto-reconnect when app is backgrounded
      socket.io.opts.autoConnect = false;
      socket.disconnect();
      setConnectionStatus('disconnected');
      setSocket(undefined);
    }
    isActiveRef.current = false;
  }, [socket]);

  const sendMessage: ISocketContext["sendMessage"] = useCallback(
    (msg) => {
      console.log("Send Message", msg);
      if (socket) {
        socket.emit("chat:send", { message: msg });
      }
    },
    [socket]
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <SocketContext.Provider value={{ sendMessage, messages, connectSocket, disconnectSocket, notifications, clearNotifications, connectionStatus }}>
      {children}
    </SocketContext.Provider>
  );
};