import { streamText } from "ai";
import { TASTE_DISCOVERY_SYSTEM_PROMPT } from "./prompts";
import { saveUserInterests } from "./tools/interests.tool";
import { azure, createAzure } from "@ai-sdk/azure";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export class Assistant {
  azure = createAzure();
  private model = azure.languageModel("gpt-4.1");

  async streamChat(messages: ChatMessage[], userId?: string) {
    const result = streamText({
      model: this.model,
      messages,
      system: TASTE_DISCOVERY_SYSTEM_PROMPT,
      maxTokens: 1000,
      tools: userId
        ? {
            saveUserInterests: {
              ...saveUserInterests,
              execute: async (params, options) => {
                return saveUserInterests.execute!(params, {
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
              ...saveUserInterests,
              execute: async (params, options) => {
                // Pass userId through the execution context
                return saveUserInterests.execute!(params, {
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
