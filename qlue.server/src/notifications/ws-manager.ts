import type { ServerWebSocket } from "bun";
import { FeedUpdateEvent } from "./event";

class WebSocketManager {
  private connections = new Map<string, Set<ServerWebSocket>>();

  addConnection(userId: string, ws: ServerWebSocket) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(ws);
  }

  removeConnection(userId: string, ws: ServerWebSocket) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(ws);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
    }
  }

  sendToUser<T>(userId: string, event: FeedUpdateEvent<T>): boolean {
    const userConnections = this.connections.get(userId);
    if (!userConnections) return false;

    const message = JSON.stringify(event);
    let sent = false;

    userConnections.forEach((ws) => {
      if (ws.readyState === 1) {
        ws.send(message);
        sent = true;
      }
    });

    return sent;
  }

  isUserConnected(userId: string): boolean {
    return (
      this.connections.has(userId) && this.connections.get(userId)!.size > 0
    );
  }
}
export { WebSocketManager };
