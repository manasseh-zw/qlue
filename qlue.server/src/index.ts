import { serve } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "../server.config";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { TASTE_DISCOVERY_SYSTEM_PROMPT } from "./promtps";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: [config.clientUrl],
    allowHeaders: ["Content-Type"],
    allowMethods: ["POST", "GET", "OPTIONS"],
  })
);

app.post("/api/chat", async (c) => {
  const { messages } = await c.req.json();

  const result = streamText({
    model: openai("gpt-4.1"),
    messages,
    system: TASTE_DISCOVERY_SYSTEM_PROMPT,
    maxTokens: 1000,
  });

  return result.toDataStreamResponse();
});

serve({ fetch: app.fetch, port: 8080 });
