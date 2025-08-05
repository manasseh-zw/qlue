import {
  TasteProfileResult,
  tasteProfilingAgent,
} from "./agents/profiler.agent";
import { type UserInterests } from "./agents/tools/interests.tool";
import { prisma } from "../db/db";
import {
  AgentStartedEvent,
  AgentCompletedEvent,
  MessageUpdateData,
  TimelineUpdateData,
} from "./events/event";
import { Events } from "../ws/event";

class Orchestrator {
  private static instance: Orchestrator;
  private activeProcessing = new Map<string, boolean>();

  static getInstance(): Orchestrator {
    if (!Orchestrator.instance) {
      Orchestrator.instance = new Orchestrator();
    }
    return Orchestrator.instance;
  }

  async startAgentProcessing(
    userId: string,
    userInterests: UserInterests
  ): Promise<void> {
    if (this.activeProcessing.get(userId)) {
      console.log(`⚠️  Agent processing already active for user: ${userId}`);
      return;
    }

    console.log(`🚀 Starting agent processing for user: ${userId}`);
    this.activeProcessing.set(userId, true);

    try {
      // Small delay to ensure user has landed on profiler page
      await this.delay(4000);

      // Send initial agent started event
      const agentStartedData: AgentStartedEvent = {
        message:
          "🤖 I'm starting to analyze your taste profile! Let me show you what I discover...",
        redirectTo: "/profiler",
        userId,
      };

      Events.sendToUser(userId, "agent_started", agentStartedData);

      // Initialize timeline
      this.sendTimelineUpdate(userId, " ", [
        {
          id: "1",
          text: "Gathering Your Interests",
          status: "in_progress",
          type: "question",
        },
        {
          id: "2",
          text: "Resolving Entities",
          status: "pending",
          type: "analysis",
        },
        {
          id: "3",
          text: "Expanding Domains",
          status: "pending",
          type: "analysis",
        },
        {
          id: "4",
          text: "Cross-Domain Analysis",
          status: "pending",
          type: "synthesis",
        },
        {
          id: "5",
          text: "Final Synthesis",
          status: "pending",
          type: "synthesis",
        },
      ]);

      const result = await tasteProfilingAgent.generateTasteProfile({
        ...userInterests,
        userId,
      });

      await this.saveTasteProfileResults(userId, result);

      const agentCompletedData: AgentCompletedEvent = {
        message:
          "✨ Your taste profile is complete! Ready to explore personalized experiences.",
        redirectTo: "/app",
        userId,
      };

      Events.sendToUser(userId, "agent_completed", agentCompletedData);
    } catch (error) {
      console.error(`❌ Error in agent processing for user ${userId}:`, error);
      this.sendMessageUpdate(
        userId,
        "final_synthesis",
        "I encountered an issue while processing your profile. Let me try again!",
        "Error during processing"
      );
    } finally {
      this.activeProcessing.set(userId, false);
    }
  }

  private sendMessageUpdate(
    userId: string,
    stage: string,
    message: string,
    reasoning: string
  ): void {
    const messageData: MessageUpdateData = {
      message,
      reasoning,
      stage,
    };

    Events.sendToUser(userId, "message", messageData);
  }

  private sendTimelineUpdate(
    userId: string,
    stage: string,
    timeline: any[]
  ): void {
    const timelineData: TimelineUpdateData = {
      timeline,
      currentStage: stage,
    };

    Events.sendToUser(userId, "timeline_update", timelineData);
  }

  private async saveTasteProfileResults(
    userId: string,
    result: TasteProfileResult
  ): Promise<void> {
    try {
      const tasteProfile = await prisma.tasteProfile.create({
        data: {
          data: JSON.stringify(result),
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          tasteProfileId: tasteProfile.id,
        },
      });

      console.log(`💾 Saved taste profile results for user: ${userId}`);
    } catch (error) {
      console.error(`❌ Error saving taste profile for user ${userId}:`, error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  isProcessing(userId: string): boolean {
    return this.activeProcessing.get(userId) || false;
  }
}

export const orchestrator = Orchestrator.getInstance();
