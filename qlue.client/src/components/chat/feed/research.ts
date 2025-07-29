export enum TimelineItemStatus {
  Completed = "Completed",
  InProgress = "InProgress",
  Pending = "Pending",
}

export enum TimelineItemType {
  Question = "Question",
  Analysis = "Analysis",
  Synthesis = "Synthesis",
}

export interface TimelineItem {
  id: string;
  text: string;
  status: TimelineItemStatus;
  type: TimelineItemType;
}
