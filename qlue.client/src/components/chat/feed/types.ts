// WebSocket event types
export type EventType =
  | "insight"
  | "message"
  | "timeline_update"
  | "agent_update"
  | "agent_started"
  | "agent_completed"
  | "redirect"
  | "connected"
  | "ping"
  | "pong";

export type Event<T = any> = {
  id: string;
  type: EventType;
  data: T;
  userId?: string;
  timestamp: number;
};

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

// Frontend component types
export type EntityData = {
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

export type InsightData = {
  entity: EntityData;
  context: {
    stage: string;
    reasoning: string;
    domainType?: string;
  };
};

export type MessageData = {
  message: string;
  reasoning?: string;
  stage: string;
};

export type TimelineItem = {
  id: string;
  text: string;
  status: "pending" | "in_progress" | "completed";
  type: "question" | "analysis" | "synthesis";
};

export type AgentFeedProps = {
  currentStage: string;
  timeline: TimelineItem[];
  feedItems: Array<{
    type: "message" | "insight";
    data: MessageData | InsightData;
    id: string;
  }>;
};
