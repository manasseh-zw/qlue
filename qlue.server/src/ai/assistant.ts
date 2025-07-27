import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { TASTE_DISCOVERY_SYSTEM_PROMPT } from "./prompts";
import { saveUserInterestsTool } from "./tools/interests.tool";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export class Assistant {
  private model = openai("gpt-4.1");

  async streamChat(messages: ChatMessage[], userId?: string) {
    const result = streamText({
      model: this.model,
      messages,
      system: TASTE_DISCOVERY_SYSTEM_PROMPT,
      maxTokens: 1000,
      tools: userId
        ? {
            saveUserInterests: {
              ...saveUserInterestsTool,
              execute: async (params, options) => {
                // Pass userId through the execution context
                return saveUserInterestsTool.execute!(params, {
                  ...options,
                  userId,
                } as any);
              },
            },
          }
        : undefined,
      maxSteps: 3,
    });

    return result.toDataStreamResponse();
  }

  async generateResponse(messages: ChatMessage[], userId?: string) {
    const result = await streamText({
      model: this.model,
      messages,
      system: TASTE_DISCOVERY_SYSTEM_PROMPT,
      maxTokens: 1000,
      tools: userId
        ? {
            saveUserInterests: {
              ...saveUserInterestsTool,
              execute: async (params, options) => {
                // Pass userId through the execution context
                return saveUserInterestsTool.execute!(params, {
                  ...options,
                  userId,
                } as any);
              },
            },
          }
        : undefined,
      maxSteps: 3,
    });

    return result;
  }
}

export const assistant = new Assistant();
