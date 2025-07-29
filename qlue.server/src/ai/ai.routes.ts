import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { getUserFromSession } from "../auth/auth.service";
import { assistant } from "./conversation.agent";

const aiRoutes = new Hono();

aiRoutes.post("/", async (c) => {
  const sessionToken = getCookie(c, "session_token");
  const user = await getUserFromSession(sessionToken || "");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { messages } = await c.req.json();
  const response = await assistant.streamChat(messages, user.id);

  return response;
});

export { aiRoutes };