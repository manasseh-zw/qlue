import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { getUserFromSession } from "../auth/auth.service";
import { assistant } from "./agents/conversation.agent";
import { TavusService } from "./providers/tavus.service";
import { TasteProfileService } from "../insights/taste.service";


const aiRoutes = new Hono();
const tavusService = new TavusService();
const tasteProfileService = new TasteProfileService();

aiRoutes.get("/test", async (c) => {
  return c.json({ message: "AI routes are working!", timestamp: new Date().toISOString() });
});

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

aiRoutes.post("/tavus/conversation", async (c) => {
  console.log("🎯 Tavus conversation endpoint hit");
  
  const sessionToken = getCookie(c, "session_token");
  console.log("Session token:", sessionToken ? "present" : "missing");
  
  const user = await getUserFromSession(sessionToken || "");
  console.log("User:", user ? `found (${user.id})` : "not found");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    console.log("Request body:", body);
    
    const { personaId, replicaId, mode, customGreeting } = body;

    if (!personaId || !mode) {
      return c.json({ error: "personaId and mode are required" }, 400);
    }

    console.log("Getting taste profile for user:", user.id);
    // Get user's taste profile from database
    const tasteProfile = await tasteProfileService.getUserTasteProfile(user.id);
    console.log("Taste profile:", tasteProfile ? "found" : "not found");

    if (!tasteProfile) {
      return c.json({ error: "No taste profile found. Please complete your taste profiling first." }, 404);
    }

    const request = {
      userId: user.id,
      personaId,
      replicaId,
      mode,
      customGreeting
    };

    console.log("Creating Tavus conversation with request:", request);
    const response = await tavusService.createConversation(request, tasteProfile);
    console.log("Tavus response:", response);

    return c.json(response);
  } catch (error) {
    console.error("Failed to create Tavus conversation:", error);
    return c.json({ error: "Failed to create conversation" }, 500);
  }
});

aiRoutes.get("/tavus/conversation/:conversationId", async (c) => {
  const sessionToken = getCookie(c, "session_token");
  const user = await getUserFromSession(sessionToken || "");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const conversationId = c.req.param("conversationId");
    const response = await tavusService.getConversation(conversationId);
    return c.json(response);
  } catch (error) {
    console.error("Failed to get Tavus conversation:", error);
    return c.json({ error: "Failed to get conversation" }, 500);
  }
});

aiRoutes.post("/tavus/conversation/:conversationId/end", async (c) => {
  const sessionToken = getCookie(c, "session_token");
  const user = await getUserFromSession(sessionToken || "");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const conversationId = c.req.param("conversationId");
    await tavusService.endConversation(conversationId);
    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to end Tavus conversation:", error);
    return c.json({ error: "Failed to end conversation" }, 500);
  }
});

aiRoutes.delete("/tavus/conversation/:conversationId", async (c) => {
  const sessionToken = getCookie(c, "session_token");
  const user = await getUserFromSession(sessionToken || "");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const conversationId = c.req.param("conversationId");
    await tavusService.deleteConversation(conversationId);
    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to delete Tavus conversation:", error);
    return c.json({ error: "Failed to delete conversation" }, 500);
  }
});

export { aiRoutes };