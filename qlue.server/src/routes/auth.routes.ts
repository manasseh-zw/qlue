import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { config } from "../../server.config";
import {
  deleteSession,
  getGoogleAuthUrl,
  getUserFromSession,
  handleGoogleCallback,
} from "../services/auth.service";

const authRoutes = new Hono();

// Google OAuth initiation
authRoutes.get("/google", (c) => {
  const authUrl = getGoogleAuthUrl();
  return c.redirect(authUrl);
});

// Google OAuth callback
authRoutes.get("/google/callback", async (c) => {
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
authRoutes.post("/logout", async (c) => {
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

export { authRoutes };
