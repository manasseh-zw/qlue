export interface FeedUpdateEvent<T = any> {
  id: string;
  stage: "entity_resolution" | "domain_expansion" | "cross_domain_insights" | "final_synthesis";
  type: "insight" | "message" | "timeline_update" | "agent_update";
  data: T;
  userId?: string;
  timestamp: number;
}
