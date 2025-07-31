import type { ServerWebSocket } from "bun";
import { Event } from "./event";

class WebSocketManager {
  private static instance: WebSocketManager;
  private connections = new Map<string, Set<ServerWebSocket>>();

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  addConnection(userId: string, ws: ServerWebSocket) {
    // Close any existing connections for this user to ensure only one active connection
    const existingConnections = this.connections.get(userId);
    if (existingConnections) {
      existingConnections.forEach((existingWs) => {
        if (existingWs.readyState === 1) {
          existingWs.close(1000, "New connection established");
        }
      });
      existingConnections.clear();
    }

    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(ws);
    console.log(`🔌 WebSocket connection established for user: ${userId}`);
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

  sendToUser<T>(userId: string, event: Event<T>): boolean {
    const userConnections = this.connections.get(userId);
    if (!userConnections) return false;

    const message = JSON.stringify(event);
    let sent = false;

    // Clean up any closed connections before sending
    const closedConnections: ServerWebSocket[] = [];
    userConnections.forEach((ws) => {
      if (ws.readyState !== 1) {
        closedConnections.push(ws);
      } else {
        ws.send(message);
        sent = true;
      }
    });

    // Remove closed connections
    closedConnections.forEach((ws) => userConnections.delete(ws));
    if (userConnections.size === 0) {
      this.connections.delete(userId);
    }

    return sent;
  }

  isUserConnected(userId: string): boolean {
    return (
      this.connections.has(userId) && this.connections.get(userId)!.size > 0
    );
  }
}
export { WebSocketManager };
