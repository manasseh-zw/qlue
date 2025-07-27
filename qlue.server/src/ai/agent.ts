import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { tasteTools } from "./tools/taste.tools";
import { TASTE_PROFILING_AGENT_PROMPT } from "./prompts";
import { anthropic } from "@ai-sdk/anthropic";
import { TasteProfile } from "@prisma/client";

export class TasteProfilingAgent {
  private model = anthropic("claude-4-sonnet-20250514");

  async generateTasteProfile(input: TasteProfile) : Promise<string> {
    console.log("🤖 TasteProfilingAgent: Starting taste profile generation");
    console.log("📊 Input data:", JSON.stringify(input, null, 2));
    
    try {
      console.log("🔄 Calling AI model with tools...");
      const startTime = Date.now();
      
      const { text, toolCalls, finishReason } = await generateText({
        
        model: this.model,
        system: TASTE_PROFILING_AGENT_PROMPT,
        tools: tasteTools,
        prompt: `
        given the follwoing user data points lets build a taste profile ${JSON.stringify(
          input,
          null,
          2
        )}
        `,
        maxSteps: 20,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log("✅ AI model completed successfully");
      console.log(`⏱️  Processing time: ${duration}ms`);
      console.log(`🔧 Tool calls made: ${toolCalls?.length || 0}`);
      console.log(`🏁 Finish reason: ${finishReason}`);
      
      if (toolCalls && toolCalls.length > 0) {
        console.log("🛠️  Tool calls details:");
        toolCalls.forEach((call, index) => {
          console.log(`  ${index + 1}. Tool: ${call.toolName}`);
          console.log(`     Args: ${JSON.stringify(call.args, null, 2)}`);
        });
      }
      
      console.log("📝 Generated taste profile length:", text.length, "characters");
      console.log("🎯 Taste profile preview:", text.substring(0, 200) + "...");
      
      return text;
    } catch (error) {
      console.error("❌ Error in taste profile generation:", error);
      throw error;
    }
  }


}

export const tasteProfilingAgent = new TasteProfilingAgent();
