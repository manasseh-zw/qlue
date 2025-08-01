import { Hono } from "hono";
import {
  getInsights,
  resolveEntities,
  crossDomainProfile,
} from "./insights.service";
import { tasteProfilingAgent } from "../ai/agents/profiler.agent";
import { TasteProfileService } from "./taste.service";
import { getUserFromSession } from "../auth/auth.service";
import { getCookie } from "hono/cookie";

const insightRoutes = new Hono();
const tasteProfileService = new TasteProfileService();

// Get authenticated user's taste profile
insightRoutes.get("/me", async (c) => {
  try {
    const sessionToken = getCookie(c, "session_token");
    const user = await getUserFromSession(sessionToken || "");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const tasteProfile = await tasteProfileService.getUserTasteProfile(user.id);
    
    if (!tasteProfile) {
      return c.json({ error: "No taste profile found" }, 404);
    }

    return c.json(tasteProfile);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

insightRoutes.post("/insights", async (c) => {
  try {
    const body = await c.req.json();
    const result = await getInsights(body);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

insightRoutes.post("/resolve", async (c) => {
  try {
    const body = await c.req.json();
    const result = await resolveEntities(body);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

insightRoutes.post("/profile", async (c) => {
  try {
    const body = await c.req.json();
    const result = await crossDomainProfile(body);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

insightRoutes.post("/agent", async (c) => {
  try {
    const body = await c.req.json();

    const result = await tasteProfilingAgent.generateTasteProfile(body);
    return c.text(result.finalAnalysis);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

export { insightRoutes };
