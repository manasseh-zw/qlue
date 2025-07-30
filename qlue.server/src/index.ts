import { serve } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "../server.config";
import { authRoutes } from "./auth/auth.routes";
import { insightRoutes } from "./insights/insight.routes";
import { aiRoutes } from "./ai/ai.routes";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { WebSocketManager } from "./notifications/ws-manager";
import { EventType } from "./notifications/event";

const app = new Hono();
const wsManager = new WebSocketManager();
const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

export const Events = {
  sendToUser: <T>(userId: string, type: EventType, data: T) => {
    return wsManager.sendToUser(userId, {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      data,
      userId,
      timestamp: Date.now(),
    });
  },

  isUserOnline: (userId: string) => wsManager.isUserConnected(userId),
};

app.use(
  "/*",
  cors({
    origin: [config.clientUrl],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "PATCH"],
    credentials: true,
  })
);

app.route("/api/auth", authRoutes);
app.route("/api/insights", insightRoutes);
app.route("/api/ai", aiRoutes);

app.post("/api/test-ws/:userId", async (c) => {
  const userId = c.req.param("userId");
  const body = await c.req.json();

  const success = Events.sendToUser(userId, "message", {
    message: body.message || "Test message from server",
    timestamp: new Date().toISOString(),
  });

  return c.json({
    success,
    message: success ? "Message sent to user" : "User not connected",
    userId,
  });
});

app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get(
  "/ws/:userId",
  upgradeWebSocket((c) => {
    const userId = c.req.param("userId");

    return {
      onOpen: (evt, ws) => {
        wsManager.addConnection(userId, ws.raw as ServerWebSocket);

        // Send connection confirmation
        ws.send(
          JSON.stringify({
            id: `conn_${Date.now()}`,
            type: "connected",
            data: { message: "WebSocket connected", userId },
            timestamp: Date.now(),
          })
        );
      },

      onMessage: (evt, ws) => {
        try {
          const message = JSON.parse(evt.data.toString());

          // Handle incoming messages from client
          switch (message.type) {
            case "ping":
              ws.send(
                JSON.stringify({
                  id: `pong_${Date.now()}`,
                  type: "pong",
                  data: { timestamp: Date.now() },
                  timestamp: Date.now(),
                })
              );
              break;

            case "subscribe":
              // Handle channel subscriptions
              break;

            default:
              console.log("Unknown message type:", message.type);
          }
        } catch (error) {
          console.error("Invalid message format:", error);
        }
      },

      onClose: (evt, ws) => {
        wsManager.removeConnection(userId, ws.raw as ServerWebSocket);
        console.log(`WebSocket closed for user: ${userId}`);
      },

      onError: (evt, ws) => {
        console.error("WebSocket error:", evt);
        wsManager.removeConnection(userId, ws.raw as ServerWebSocket);
      },
    };
  })
);

serve({ fetch: app.fetch, websocket, port: 8080 });

console.log("🚀 Server running on http://localhost:8080");
