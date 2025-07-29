import { createFileRoute } from "@tanstack/react-router";
import { protectedLoader } from "@/lib/loaders/auth.loaders";
import AgentFeed from "../../components/chat/feed/agent-feed";
import {
  TimelineItemStatus,
  TimelineItemType,
  type TimelineItem,
} from "../../components/chat/feed/research";
import { useEffect, useState } from "react";

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

const initialTimeline: TimelineItem[] = [
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

const initialInsights = [
  "Identified key market trends",
  "Analyzed competitor strategies",
  "Evaluated potential growth opportunities",
];

function TasteProfileComponent() {
  const [isConnected, setIsConnected] = useState(false);
  const [userId] = useState("test-user-123"); // In real app, get from auth

  // Agent feed state
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);
  const [insights, setInsights] = useState<string[]>(initialInsights);
  const [agentName, setAgentName] = useState("AI Assistant");
  const [currentStage, setCurrentStage] = useState("Analyzing");
  const [progress, setProgress] = useState(50);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/ws/${userId}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data);

        switch (data.type) {
          case "timeline_update":
            console.log("Updating timeline:", data.data.timeline);
            setTimeline(
              data.data.timeline.map((item: any) => ({
                id: item.id,
                text: item.text,
                status:
                  item.status === "completed"
                    ? TimelineItemStatus.Completed
                    : item.status === "in_progress"
                      ? TimelineItemStatus.InProgress
                      : TimelineItemStatus.Pending,
                type:
                  item.type === "question"
                    ? TimelineItemType.Question
                    : item.type === "analysis"
                      ? TimelineItemType.Analysis
                      : TimelineItemType.Synthesis,
              }))
            );
            break;

          case "insight":
            console.log("Updating insights:", data.data.insights);
            setInsights(data.data.insights);
            break;

          case "agent_update":
            console.log("Updating agent:", data.data);
            setAgentName(data.data.agentName || agentName);
            setCurrentStage(data.data.currentStage || currentStage);
            setProgress(data.data.progress || progress);
            break;

          case "message":
            console.log("Received message:", data.data.message);
            break;

          default:
            console.log("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [userId]);

  const sendAgentFeedUpdate = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/test-agent-feed/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stage: "Processing",
            progress: Math.floor(Math.random() * 100),
          }),
        }
      );

      const result = await response.json();
      console.log("Agent feed update result:", result);
    } catch (error) {
      console.error("Error sending agent feed update:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="w-full max-w-4xl px-4">
        {/* WebSocket Test Panel */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">
            Agent Feed WebSocket Test
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <span
              className={`px-2 py-1 rounded text-sm ${
                isConnected
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </span>
            <button
              onClick={sendAgentFeedUpdate}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Send Agent Feed Update
            </button>
          </div>
          <div className="text-sm text-gray-600">
            <p>Current Stage: {currentStage}</p>
            <p>Progress: {progress}%</p>
            <p>Timeline Items: {timeline.length}</p>
            <p>Insights: {insights.length}</p>
          </div>
        </div>

        <AgentFeed
          props={{
            agentName: agentName,
            agentAvatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=1",
            currentStage: currentStage,
            timeline: timeline,
            insights: insights,
          }}
        />
      </div>
    </div>
  );
}
