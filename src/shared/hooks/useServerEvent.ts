import { useEffect, useRef } from "react";

type EventHandler<T> = (data: T) => void;

// Store the shared EventSource instance
let eventSource: EventSource | null = null;
const eventHandlers: Record<string, Set<(event: any) => void>> = {};

const eventSourceUrl = "/api/events";

// Custom hook to handle Server-Sent Events (SSE)
export function useServerEvent<T>(
  eventName: string,
  handler: EventHandler<T>,
  scope?: Record<string, number | string>,
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);


  useEffect(() => {
    // Initialize EventSource connection if not already present
    if (!eventSource) {
      eventSource = new EventSource(eventSourceUrl); // Replace with your SSE endpoint

      // Set up generic listener to dispatch events to the registered handlers
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { type, payload } = data;
          if (eventHandlers[type]) {
            eventHandlers[type].forEach((callback) => callback(payload));
          }
        } catch (err) {
          console.error("Error parsing SSE event", err);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error", error);
        eventSource?.close();
      };
    }

    // Register the handler for the specified event
    if (!eventHandlers[eventName]) {
      eventHandlers[eventName] = new Set();
    }
    eventHandlers[eventName].add((event) => handlerRef.current(event));

    // Clean up the handler when the component unmounts
    return () => {
      eventHandlers[eventName].delete((event) => handlerRef.current(event));

      // If no handlers remain, close the SSE connection
      if (eventHandlers[eventName].size === 0) {
        delete eventHandlers[eventName];
      }

      if (Object.keys(eventHandlers).length === 0 && eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }, [eventName]);
}
