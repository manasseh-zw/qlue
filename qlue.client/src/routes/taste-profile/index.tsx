import { createFileRoute } from "@tanstack/react-router";
import { protectedLoader } from "@/lib/loaders/auth.loaders";
import AgentFeed from "../../components/chat/feed/agent-feed";
import {
  TimelineItemStatus,
  TimelineItemType,
  type TimelineItem,
} from "../../components/chat/feed/research";

interface UserInterests {
  name: string;
  age: number;
  gender: string;
  music: string[];
  podcasts: string[];
  booksShowsMovies: string[];
  hobbiesOther: string[];
}

export const Route = createFileRoute("/taste-profile/")({
  component: TasteProfileComponent,
  loader: protectedLoader,
});

const sampleTimeline: TimelineItem[] = [
  {
    id: "1",
    text: "Gathering Information",
    status: TimelineItemStatus.Completed,
    type: TimelineItemType.Question,
  },
  {
    id: "2",
    text: "Analyzing Data",
    status: TimelineItemStatus.InProgress,
    type: TimelineItemType.Analysis,
  },
  {
    id: "3",
    text: "Synthesizing Results",
    status: TimelineItemStatus.Pending,
    type: TimelineItemType.Synthesis,
  },
];

const sampleInsights = [
  "Identified key market trends",
  "Analyzed competitor strategies",
  "Evaluated potential growth opportunities",
  "Evaluated potential growth opportunities",
  "Evaluated potential growth opportunities",
  "Evaluated potential growth opportunities",
  "Evaluated potential growth opportunities",
];

function TasteProfileComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="w-full max-w-4xl px-4">
        <AgentFeed
          props={{
            agentName: "AI Assistant",
            agentAvatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=1",
            currentStage: "Analyzing",
            timeline: sampleTimeline,
            insights: sampleInsights,
          }}
        />
      </div>
    </div>
  );
}
