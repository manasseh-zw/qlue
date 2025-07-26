import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { getUserFromSession, updateUser } from "../services/auth.service";

const userRoutes = new Hono();

// Get current user endpoint
userRoutes.get("/", async (c) => {
  const sessionToken = getCookie(c, "session_token");
  const user = await getUserFromSession(sessionToken || "");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({ user });
});

// Update user data endpoint
userRoutes.patch("/", async (c) => {
  const sessionToken = getCookie(c, "session_token");
  const user = await getUserFromSession(sessionToken || "");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const updateData = await c.req.json();
  const updatedUser = await updateUser(user.id, updateData);

  return c.json({ user: updatedUser });
});

export { userRoutes };
