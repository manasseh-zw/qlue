export enum TimelineItemStatus {
  Pending = "pending",
  InProgress = "in_progress", 
  Completed = "completed"
}

export enum TimelineItemType {
  Question = "question",
  Analysis = "analysis", 
  Synthesis = "synthesis"
}

export interface TimelineItem {
  id: string;
  text: string;
  status: TimelineItemStatus;
  type: TimelineItemType;
}
