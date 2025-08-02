import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { config } from "../../server.config";
import {
  deleteSession,
  getUserFromSession,
  login,
  signup,
  updateUser,
} from "./auth.service";

const authRoutes = new Hono();

// Signup endpoint
authRoutes.post("/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password) {
      return c.json({ 
        success: false, 
        errors: ["Email and password are required"] 
      }, 400);
    }

    const { user, sessionToken } = await signup({ email, password, name });

    // Set session cookie
    setCookie(c, "session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return c.json({ success: true, data: user });
  } catch (error) {
    return c.json(
      { 
        success: false, 
        errors: [error instanceof Error ? error.message : "Signup failed"] 
      },
      400
    );
  }
});

// Login endpoint
authRoutes.post("/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ 
        success: false, 
        errors: ["Email and password are required"] 
      }, 400);
    }

    const { user, sessionToken } = await login({ email, password });

    // Set session cookie
    setCookie(c, "session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return c.json({ success: true, data: user });
  } catch (error) {
    return c.json(
      { 
        success: false, 
        errors: [error instanceof Error ? error.message : "Login failed"] 
      },
      400
    );
  }
});

// Get current user endpoint
authRoutes.get("/me", async (c) => {
  const sessionToken = getCookie(c, "session_token");
  const user = await getUserFromSession(sessionToken || "");

  if (!user) {
    return c.json({ 
      success: false, 
      errors: ["Unauthorized"] 
    }, 401);
  }

  return c.json({ success: true, data: user });
});

// Update current user endpoint
authRoutes.patch("/me/update", async (c) => {
  const sessionToken = getCookie(c, "session_token");
  const user = await getUserFromSession(sessionToken || "");

  if (!user) {
    return c.json({ 
      success: false, 
      errors: ["Unauthorized"] 
    }, 401);
  }

  try {
    const updateData = await c.req.json();
    const updatedUser = await updateUser(user.id, updateData);

    return c.json({ success: true, data: updatedUser });
  } catch (error) {
    return c.json(
      { 
        success: false, 
        errors: [error instanceof Error ? error.message : "Update failed"] 
      },
      400
    );
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
