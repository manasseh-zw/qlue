import { WebSocketManager } from "./ws-manager";

export type EventType =
  | "insight"
  | "message"
  | "timeline_update"
  | "agent_update"
  | "agent_started"
  | "agent_completed"
  | "redirect"
  | "connected"
  | "ping"
  | "pong";

export type Event<T = any> = {
  id: string;
  type: EventType;
  data: T;
  userId?: string;
  timestamp: number;
};

export const Events = {
  sendToUser: <T>(userId: string, type: EventType, data: T) => {
    return WebSocketManager.getInstance().sendToUser(userId, {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      data,
      userId,
      timestamp: Date.now(),
    });
  },

  isUserOnline: (userId: string) =>
    WebSocketManager.getInstance().isUserConnected(userId),
};
