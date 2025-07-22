import { serve } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { setCookie, getCookie } from "hono/cookie";
import { config } from "../server.config";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { TASTE_DISCOVERY_SYSTEM_PROMPT } from "./promtps";
import {
  deleteSession,
  getGoogleAuthUrl,
  getUserFromSession,
  handleGoogleCallback,
  updateUser,
} from "./auth/auth.service";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: [config.clientUrl],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    credentials: true,
  })
);

// Google OAuth initiation
app.get("/api/auth/google", (c) => {
  const authUrl = getGoogleAuthUrl();
  return c.redirect(authUrl);
});

// Google OAuth callback
app.get("/api/auth/google/callback", async (c) => {
  try {
    const code = c.req.query("code");
    if (!code) {
      return c.redirect(`${config.clientUrl}/?error=no_code`);
    }

    const { user, sessionToken } = await handleGoogleCallback(code);

    // Set session cookie
    setCookie(c, "session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    // Redirect to chat
    return c.redirect(`${config.clientUrl}/chat`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return c.redirect(`${config.clientUrl}/?error=auth_failed`);
  }
});

// Logout endpoint
app.post("/api/auth/logout", async (c) => {
  const sessionToken = getCookie(c, "session_token");
  if (sessionToken) {
    await deleteSession(sessionToken);
  }

  setCookie(c, "session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 0,
    path: "/",
  });

  return c.json({ success: true });
});

// Get current user endpoint
app.get("/api/user", async (c) => {
  const sessionToken = getCookie(c, "session_token");
  const user = await getUserFromSession(sessionToken || "");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({ user });
});

// Protected chat endpoint
app.post("/api/chat", async (c) => {
  const sessionToken = getCookie(c, "session_token");
  const user = await getUserFromSession(sessionToken || "");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { messages } = await c.req.json();
  const result = streamText({
    model: openai("gpt-4.1"),
    messages,
    system: TASTE_DISCOVERY_SYSTEM_PROMPT,
    maxTokens: 1000,
  });

  return result.toDataStreamResponse();
});

// Update user data endpoint
app.patch("/api/user", async (c) => {
  const sessionToken = getCookie(c, "session_token");
  const user = await getUserFromSession(sessionToken || "");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const updateData = await c.req.json();
  const updatedUser = await updateUser(user.id, updateData);

  return c.json({ user: updatedUser });
});

serve({ fetch: app.fetch, port: 8080 });

console.log("🚀 Server running on http://localhost:8080");
