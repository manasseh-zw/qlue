import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { TASTE_DISCOVERY_SYSTEM_PROMPT } from "./prompts";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export class Assistant {
  private model = openai("gpt-4.1");
  
  async streamChat(messages: ChatMessage[]) {
    const result = streamText({
      model: this.model,
      messages,
      system: TASTE_DISCOVERY_SYSTEM_PROMPT,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  }

}

export const assistant = new Assistant(); 