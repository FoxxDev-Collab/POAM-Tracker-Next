'use client';

import { useEffect, useRef, useState } from 'react';

interface SSEMessage {
  type: string;
  message?: string;
  [key: string]: unknown;
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
        } catch {
          // Error parsing SSE message
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

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setError('Connection failed. Max reconnection attempts reached.');
        }
      };

    } catch {
      setError('Failed to establish SSE connection');
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

  const sendMessage = async (message: unknown) => {
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
    } catch {
      // Error sending SSE message
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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