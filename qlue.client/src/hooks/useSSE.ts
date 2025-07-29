import { useEffect, useState, useRef } from 'react';

export function useSSE<T>(url: string, options?: {
  onMessage?: (data: T) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  enabled?: boolean;
}) {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!options?.enabled) return;

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      options?.onOpen?.();
    };

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
        options?.onMessage?.(parsedData);
      } catch (err) {
        console.error('Failed to parse SSE data:', err);
      }
    };

    eventSource.addEventListener('feed-update', (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
        options?.onMessage?.(parsedData);
      } catch (err) {
        console.error('Failed to parse feed-update data:', err);
      }
    });

    eventSource.addEventListener('complete', () => {
      eventSource.close();
      setIsConnected(false);
    });

    eventSource.onerror = (error) => {
      setError('Connection error');
      setIsConnected(false);
      options?.onError?.(error);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [url, options?.enabled]);

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setIsConnected(false);
    }
  };

  return {
    data,
    isConnected,
    error,
    disconnect
  };
}