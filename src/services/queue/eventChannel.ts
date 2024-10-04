import { config } from "@/config";
import { createClient } from "redis";

type EventListener<T> = (message: T, channel?: string) => void;
type NativeListener = EventListener<string>;

class EventChannel {
  private pubClient: ReturnType<typeof createClient>;
  private subClient: ReturnType<typeof createClient>;
  private listenersMap: Map<string, Map<EventListener<any>, NativeListener>> =
    new Map();

  constructor() {
    this.pubClient = createClient({
      password: config.cache.password,
      socket: {
        host: config.cache.host,
        port: config.cache.port,
      },
    });
    this.subClient = this.pubClient.duplicate();

    if (!this.pubClient.isOpen) this.pubClient.connect();
    if (!this.subClient.isOpen) this.subClient.connect();
  }

  async publish(channel: string, message: unknown) {
    return this.pubClient.publish(channel, JSON.stringify(message));
  }

  async subscribe<T>(channel: string, listener: EventListener<T>) {
    let listenersMapForChannel = this.listenersMap.get(channel);
    if (!listenersMapForChannel) listenersMapForChannel = new Map();

    const wrappedListener = (message: string, channel?: string) => {
      try {
        const data = JSON.parse(message);
        listener(data, channel);
      } catch {}
    };

    listenersMapForChannel.set(listener, wrappedListener);
    this.listenersMap.set(channel, listenersMapForChannel);

    this.subClient.pSubscribe(channel, wrappedListener);
  }

  async unsubscribe<T>(channel: string, listener: EventListener<T>) {
    const rawListener = this.listenersMap.get(channel)?.get(listener);
    this.subClient.pUnsubscribe(channel, rawListener);
  }
}

const eventChannel = new EventChannel();

export { eventChannel };
