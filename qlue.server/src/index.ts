import { serve } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "../server.config";
import { authRoutes } from "./auth/auth.routes";
import { insightRoutes } from "./insights/insight.routes";
import { aiRoutes } from "./ai/ai.routes";
import { createWebSocketHandler } from "./ws/ws";

const app = new Hono();
const wsHandler = createWebSocketHandler();

app.use(
  "/*",
  cors({
    origin: [config.clientUrl, "http://localhost:3000", "http://localhost:5173", "https://www.qlue.live",],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

app.route("/api/auth", authRoutes);
app.route("/api/insights", insightRoutes);
app.route("/api/ai", aiRoutes);

app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/ws/:userId", wsHandler.upgradeWebSocket(wsHandler.handler));

serve({ 
  fetch: app.fetch, 
  websocket: wsHandler.websocket, 
  port: 8080,
  idleTimeout: 255, // 5 minutes
  maxRequestBodySize: 10 * 1024 * 1024, //   10MB
});

console.log("🚀 Server running on http://localhost:8080");
