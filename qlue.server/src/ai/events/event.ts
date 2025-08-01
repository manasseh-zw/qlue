import { QlooEntity } from "../../insights/insights.service";
import { Events } from "../../ws/event";

// Agent processing lifecycle events
export type AgentStartedEvent = {
  message: string;
  redirectTo: "/profiler";
  userId: string;
};

export type AgentCompletedEvent = {
  message: string;
  redirectTo: "/app";
  userId: string;
};

// Real-time feed update events
export type MessageUpdateData = {
  message: string;
  reasoning?: string;
  stage: string;
};

export type InsightUpdateData = {
  entity: {
    name: string;
    entity_id: string;
    properties: {
      description: string;
      short_description: string;
      popularity: string;
      image: {
        url: string;
      };
    };
    tags?: Array<{
      name: string;
      tag_id: string;
      value: string;
    }>;
  };
  context: {
    stage: string;
    reasoning: string;
    domainType?: string;
  };
};

export type TimelineUpdateData = {
  timeline: Array<{
    id: string;
    text: string;
    status: "pending" | "in_progress" | "completed";
    type: "question" | "analysis" | "synthesis";
  }>;
  currentStage: string;
};

// Helper functions for streaming updates
export const AgentUpdates = {
  // Send a message update with delay
  sendMessage: async (
    userId: string,
    message: string,
    reasoning: string,
    stage: string,
    delayMs: number = 0
  ) => {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const data: MessageUpdateData = {
      message,
      reasoning,
      stage,
    };

    Events.sendToUser(userId, "message", data);
  },

  // Send insight updates with streaming delay
  sendInsightUpdate: async (
    userId: string,
    entity: QlooEntity,
    context: {
      stage: string;
      reasoning: string;
      domainType?: string;
    },
    delayMs: number = 0
  ) => {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const data: InsightUpdateData = {
      entity: {
        name: entity.name,
        entity_id: entity.entity_id,
        properties: {
          description: entity.properties?.description || "",
          short_description: entity.properties?.short_description || "",
          popularity: entity.properties?.popularity || "",
          image: {
            url: entity.properties?.image?.url || "",
          },
        },
        tags: entity.tags || [],
      },
      context,
    };

    Events.sendToUser(userId, "insight", data);
  },

  // Send timeline update
  sendTimelineUpdate: async (
    userId: string,
    timeline: Array<{
      id: string;
      text: string;
      status: "pending" | "in_progress" | "completed";
      type: "question" | "analysis" | "synthesis";
    }>,
    currentStage: string,
    delayMs: number = 0
  ) => {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const data: TimelineUpdateData = {
      timeline,
      currentStage,
    };

    Events.sendToUser(userId, "timeline_update", data);
  },

  // Stream multiple insights with delays
  streamInsights: async (
    userId: string,
    entities: any[],
    context: {
      stage: string;
      reasoning: string;
      domainType?: string;
    },
    delayBetweenMs: number = 1000
  ) => {
    for (let i = 0; i < entities.length; i++) {
      await AgentUpdates.sendInsightUpdate(
        userId,
        entities[i],
        context,
        i === 0 ? 0 : delayBetweenMs
      );
    }
  },
};
