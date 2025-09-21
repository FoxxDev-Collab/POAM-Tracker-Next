'use client';

import { useEffect, useRef, useState } from 'react';

interface SSEMessage {
  type: string;
  [key: string]: any;
}

interface UseSSEOptions {
  channel?: string;
  onMessage?: (message: SSEMessage) => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
}

export function useSSE(options: UseSSEOptions = {}) {
  const {
    channel = 'general',
    onMessage,
    onError,
    autoReconnect = true,
    maxReconnectAttempts = 5
  } = options;

  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(`/api/sse?channel=${encodeURIComponent(channel)}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        console.log(`SSE connected to channel: ${channel}`);
      };

      eventSource.onmessage = (event) => {
        try {
          const message: SSEMessage = JSON.parse(event.data);
          setLastMessage(message);

          if (onMessage) {
            onMessage(message);
          }

          // Handle specific message types
          if (message.type === 'error') {
            setError(message.message || 'Unknown error');
          }
        } catch (err) {
          console.error('Error parsing SSE message:', err);
        }
      };

      eventSource.onerror = (event) => {
        setConnected(false);

        if (onError) {
          onError(event);
        }

        // Auto-reconnect logic
        if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);

          console.log(`SSE reconnecting in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setError('Connection failed. Max reconnection attempts reached.');
        }
      };

    } catch (err) {
      setError('Failed to establish SSE connection');
      console.error('SSE connection error:', err);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setConnected(false);
  };

  const sendMessage = async (message: any) => {
    // Helper to publish messages via Redis (could be used for bidirectional communication)
    try {
      await fetch('/api/sse/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          message,
        }),
      });
    } catch (err) {
      console.error('Error sending SSE message:', err);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [channel]);

  return {
    connected,
    error,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
  };
}