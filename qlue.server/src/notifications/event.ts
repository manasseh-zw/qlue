export interface FeedUpdateEvent<T = any> {
  id: string;
  stage: "entity_resolution" | "domain_expansion" | "cross_domain_insights" | "final_synthesis" | "agent_started" | "agent_completed";
  type: "insight" | "message" | "timeline_update" | "agent_update" | "agent_started" | "agent_completed" | "redirect";
  data: T;
  userId?: string;
  timestamp: number;
}

// Agent processing lifecycle events
export interface AgentStartedEvent {
  message: string;
  redirectTo: "/profiler";
  userId: string;
}

export interface AgentCompletedEvent {
  message: string;
  redirectTo: "/app";
  userId: string;
  processingTime: number;
}

// Real-time feed update events
export interface MessageUpdateData {
  message: string;
  reasoning?: string;
  stage: string;
}

export interface InsightUpdateData {
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
}

export interface TimelineUpdateData {
  timeline: Array<{
    id: string;
    text: string;
    status: "pending" | "in_progress" | "completed";
    type: "question" | "analysis" | "synthesis";
  }>;
  currentStage: string;
}

export interface AgentUpdateData {
  agentName: string;
  currentStage: string;
  progress?: number;
  message?: string;
}
