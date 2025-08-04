export interface AgentEvent {
  type: string;
  message: string;
  redirectTo?: string;
  userId: string;
}

class EventManager {
  private static instance: EventManager;
  private sseConnections = new Map<string, any>();
  private eventListeners = new Map<string, (event: AgentEvent) => void>();

  static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  addSSEConnection(userId: string, stream: any): void {
    this.sseConnections.set(userId, stream);
    console.log(`📡 SSE connection added for user: ${userId}`);
  }

  removeSSEConnection(userId: string): void {
    this.sseConnections.delete(userId);
    console.log(`📡 SSE connection removed for user: ${userId}`);
  }

  sendEventToUser(userId: string, event: AgentEvent): void {
    const stream = this.sseConnections.get(userId);
    if (stream) {
      try {
        stream.writeSSE({
          data: JSON.stringify(event),
          event: "agent_event",
        });
        console.log(`📨 SSE event sent to user ${userId}:`, event.type);
      } catch (error) {
        console.error(`❌ Error sending SSE event to user ${userId}:`, error);
        this.removeSSEConnection(userId);
      }
    } else {
      console.log(`⚠️ No SSE connection found for user: ${userId}`);
    }
  }

  addEventListener(userId: string, listener: (event: AgentEvent) => void): void {
    this.eventListeners.set(userId, listener);
  }

  removeEventListener(userId: string): void {
    this.eventListeners.delete(userId);
  }

  notifyEventListeners(event: AgentEvent): void {
    const listener = this.eventListeners.get(event.userId);
    if (listener) {
      listener(event);
    }
  }
}

export const eventManager = EventManager.getInstance(); 