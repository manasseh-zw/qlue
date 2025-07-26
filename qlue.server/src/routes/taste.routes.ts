import { Hono } from "hono";
import { getInsights } from "../services/taste.service";

const tasteRoutes = new Hono();

tasteRoutes.post("/insights", async (c) => {
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

export { tasteRoutes };
