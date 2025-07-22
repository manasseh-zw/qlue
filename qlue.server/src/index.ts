import { serve } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "../server.config";
import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import { chatRoutes } from "./routes/chat.routes";

const app = new Hono();

// CORS middleware
app.use(
  "/*",
  cors({
    origin: [config.clientUrl],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "PATCH"],
    credentials: true,
  })
);

// Route registration
app.route("/api/auth", authRoutes);
app.route("/api/user", userRoutes);
app.route("/api/chat", chatRoutes);

// Health check endpoint
app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
serve({ fetch: app.fetch, port: 8080 });

console.log("🚀 Server running on http://localhost:8080");
