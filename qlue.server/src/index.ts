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

const app = new Hono();
const wsManager = new WebSocketManager();
const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

// Export functions to emit events from anywhere
export const Events = {
  sendToUser: <T>(
    userId: string,
    stage: "entity_resolution" | "domain_expansion" | "cross_domain_insights" | "final_synthesis",
    type: "message" | "insight" | "timeline_update" | "agent_update",
    data: T
  ) => {
    return wsManager.sendToUser(userId, {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      stage,
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

// Test route to send WebSocket messages
app.post("/api/test-ws/:userId", async (c) => {
  const userId = c.req.param("userId");
  const body = await c.req.json();
  
  const success = Events.sendToUser(userId, "entity_resolution", "message", {
    message: body.message || "Test message from server",
    timestamp: new Date().toISOString(),
  });

  return c.json({
    success,
    message: success ? "Message sent to user" : "User not connected",
    userId,
  });
});

// Test route to send agent feed updates
app.post("/api/test-agent-feed/:userId", async (c) => {
  const userId = c.req.param("userId");
  const body = await c.req.json();
  
  console.log("Sending agent feed update to user:", userId);
  
  // Send timeline update
  Events.sendToUser(userId, "entity_resolution", "timeline_update", {
    timeline: [
      {
        id: "1",
        text: "Gathering Information",
        status: "completed",
        type: "question",
      },
      {
        id: "2", 
        text: "Analyzing Data",
        status: "in_progress",
        type: "analysis",
      },
      {
        id: "3",
        text: "Synthesizing Results", 
        status: "pending",
        type: "synthesis",
      },
    ],
  });

  // Send insight update
  Events.sendToUser(userId, "domain_expansion", "insight", {
    insights: [
      "New insight: Market trends analysis complete",
      "Competitor analysis in progress",
      "Growth opportunities identified",
    ],
  });

  // Send agent update
  Events.sendToUser(userId, "cross_domain_insights", "agent_update", {
    agentName: "AI Assistant",
    currentStage: body.stage || "Analyzing",
    progress: body.progress || 75,
  });

  return c.json({
    success: true,
    message: "Agent feed updates sent",
    userId,
  });
});

// Test route to check if user is online
app.get("/api/test-ws/:userId/status", (c) => {
  const userId = c.req.param("userId");
  const isOnline = Events.isUserOnline(userId);
  
  return c.json({
    userId,
    isOnline,
    message: isOnline ? "User is connected" : "User is not connected",
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
        wsManager.addConnection(userId, ws.raw as ServerWebSocket );

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
