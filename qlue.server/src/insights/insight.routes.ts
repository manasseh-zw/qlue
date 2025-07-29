import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { getInsights, resolveEntities, crossDomainProfile } from "./insights.service";
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

// SSE endpoint for agent feed updates
insightRoutes.get("/feed", async (c) => {
  return streamSSE(c, async (stream) => {
    let id = 0;
    
    // Simulate agent workflow steps
    const steps = [
      { text: "Gathering Information", status: "InProgress", type: "Question" },
      { text: "Analyzing Data", status: "Pending", type: "Analysis" },
      { text: "Synthesizing Results", status: "Pending", type: "Synthesis" }
    ];
    
    const insights: string[] = [];
    
    // Send initial state
    await stream.writeSSE({
      data: JSON.stringify({
        timeline: steps.map((step, index) => ({
          id: String(index + 1),
          text: step.text,
          status: index === 0 ? "InProgress" : "Pending",
          type: step.type
        })),
        insights: [],
        currentStage: "Starting Analysis"
      }),
      event: "feed-update",
      id: String(id++)
    });
    
    await stream.sleep(1000);
    
    // Complete step 1
    steps[0].status = "Completed";
    steps[1].status = "InProgress";
    insights.push("Identified key market trends");
    
    await stream.writeSSE({
      data: JSON.stringify({
        timeline: steps.map((step, index) => ({
          id: String(index + 1),
          text: step.text,
          status: step.status,
          type: step.type
        })),
        insights: [...insights],
        currentStage: "Analyzing Data"
      }),
      event: "feed-update",
      id: String(id++)
    });
    
    await stream.sleep(2000);
    
    // Complete step 2
    steps[1].status = "Completed";
    steps[2].status = "InProgress";
    insights.push("Analyzed competitor strategies");
    insights.push("Evaluated potential growth opportunities");
    
    await stream.writeSSE({
      data: JSON.stringify({
        timeline: steps.map((step, index) => ({
          id: String(index + 1),
          text: step.text,
          status: step.status,
          type: step.type
        })),
        insights: [...insights],
        currentStage: "Synthesizing Results"
      }),
      event: "feed-update",
      id: String(id++)
    });
    
    await stream.sleep(1500);
    
    // Complete final step
    steps[2].status = "Completed";
    insights.push("Generated comprehensive taste profile");
    insights.push("Identified unique preference patterns");
    
    await stream.writeSSE({
      data: JSON.stringify({
        timeline: steps.map((step, index) => ({
          id: String(index + 1),
          text: step.text,
          status: step.status,
          type: step.type
        })),
        insights: [...insights],
        currentStage: "Complete"
      }),
      event: "feed-update",
      id: String(id++)
    });
    
    // Send completion event
    await stream.writeSSE({
      data: "Analysis complete",
      event: "complete",
      id: String(id++)
    });
  });
});

export { insightRoutes  };
