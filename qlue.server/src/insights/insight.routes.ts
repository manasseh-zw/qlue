import { Hono } from "hono";
import {
  getInsights,
  resolveEntities,
  crossDomainProfile,
} from "./insights.service";
import { tasteProfilingAgent } from "../ai/profiler.agent";

const insightRoutes = new Hono();

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
    return c.text(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

export { insightRoutes };
