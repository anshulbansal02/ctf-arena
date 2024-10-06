import { useEffect } from "react";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type EventName = string;
type EventHandler<T> = (data: T) => void;

type Options = {
  active?: boolean;
};

type ServerEventsState = {
  eventSubscribers: Record<EventName, number>;
  eventSource: EventSource | null;
};

const initialState = (): ServerEventsState => ({
  eventSource: null,
  eventSubscribers: {},
});

const serverEventsStore = create<ServerEventsState>()(
  subscribeWithSelector(initialState),
);

function addEventSubscriber(name: EventName) {
  serverEventsStore.setState((state) => {
    const newCount = (state.eventSubscribers[name] ?? 0) + 1;
    return {
      eventSubscribers: { ...state.eventSubscribers, [name]: newCount },
    };
  });
}

function removeEventSubscriber(name: EventName) {
  serverEventsStore.setState((state) => {
    if (!state.eventSubscribers[name]) return state;

    state.eventSubscribers[name]--;
    if (state.eventSubscribers[name] === 0) delete state.eventSubscribers[name];

    return { eventSubscribers: { ...state.eventSubscribers } };
  });
}

serverEventsStore.subscribe(
  (state) => state.eventSubscribers,
  (eventSubscribers) => {
    const subscribedEvents = Object.keys(eventSubscribers);
    const eventSourceUrl = `/api/events?${new URLSearchParams({ events: subscribedEvents.join(",") })}`;

    serverEventsStore.getState().eventSource?.close();

    if (!subscribedEvents.length) return;
    serverEventsStore.setState(() => ({
      eventSource: new EventSource(eventSourceUrl),
    }));
  },
);

const useEventSource = () => serverEventsStore().eventSource;

export function useServerEvent<T>(
  eventName: EventName,
  handler: EventHandler<T>,
  options: Options = { active: true },
) {
  const eventSource = useEventSource();

  useEffect(() => {
    if (!(eventSource && options.active)) return;

    function wrappedHandler(event: MessageEvent<any>) {
      const data = event.data;
      try {
        handler(JSON.parse(data));
      } catch {}
    }
    eventSource.addEventListener(eventName, wrappedHandler);

    return () => eventSource.removeEventListener(eventName, wrappedHandler);
  }, [eventName, eventSource, options?.active]);

  // On Event Name Change
  useEffect(() => {
    addEventSubscriber(eventName);
    return () => removeEventSubscriber(eventName);
  }, [eventName]);
}
