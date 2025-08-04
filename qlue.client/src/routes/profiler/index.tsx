import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { config } from "../../../client.config";
import type { TimelineItem } from "../../components/chat/feed/types";
import AgentFeed from "../../components/chat/feed/agent-feed";
import { authenticatedOnlyLoader } from "../../lib/loaders/auth.loaders";
import { authState } from "../../lib/state/auth.state";

export const Route = createFileRoute("/profiler/")({
  component: RouteComponent,
  loader: authenticatedOnlyLoader,
});

interface InsightData {
  entity: {
    name: string;
    entity_id: string;
    properties: {
      description: string;
      short_description: string;
      popularity: string;
      image: { url: string };
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

interface MessageData {
  message: string;
  reasoning?: string;
  stage: string;
}

function RouteComponent() {
  const { user } = authState.state;
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentStage, setCurrentStage] = useState("Initializing...");
  const [timeline, setTimeline] = useState<TimelineItem[]>([
    {
      id: "1",
      text: "Gathering Your Interests",
      status: "pending",
      type: "question",
    },
    {
      id: "2",
      text: "Resolving Entities",
      status: "pending",
      type: "analysis",
    },
    { id: "3", text: "Expanding Domains", status: "pending", type: "analysis" },
    {
      id: "4",
      text: "Cross-Domain Analysis",
      status: "pending",
      type: "synthesis",
    },
    { id: "5", text: "Final Synthesis", status: "pending", type: "synthesis" },
  ]);
  const [feedItems, setFeedItems] = useState<
    Array<{
      type: "message" | "insight";
      data: MessageData | InsightData;
      id: string;
    }>
  >([]);

  useEffect(() => {
    if (!user?.id) return;

    const wsUrl = `${config.serverUrl.replace("http", "ws")}/ws/${user.id}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("🔌 WebSocket connected for profiler");
      setIsConnected(true);
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("📨 Received WebSocket message:", message);

        switch (message.type) {
          case "message":
            setCurrentStage(message.data.message);
            setFeedItems((prev) => [
              ...prev,
              {
                type: "message",
                data: message.data,
                id: `message-${Date.now()}-${Math.random()}`,
              },
            ]);
            break;

          case "insight":
            setFeedItems((prev) => [
              ...prev,
              {
                type: "insight",
                data: message.data,
                id: `insight-${Date.now()}-${Math.random()}`,
              },
            ]);
            break;

          case "timeline_update":
            if (message.data.timeline) {
              setTimeline(message.data.timeline);
            }
            if (message.data.currentStage) {
              setCurrentStage(message.data.currentStage);
            }
            break;

          case "connected":
            console.log("✅ WebSocket connection confirmed");
            break;

          default:
            console.log("Unknown message type:", message.type);
        }
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
      }
    };

    websocket.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      setIsConnected(false);
    };

    websocket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      setIsConnected(false);
    };

    setWs(websocket);

    // Cleanup on unmount
    return () => {
      if (
        websocket.readyState === WebSocket.OPEN ||
        websocket.readyState === WebSocket.CONNECTING
      ) {
        websocket.close(1000, "Component unmounting");
      }
    };
  }, [user?.id]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const agentFeedProps = {
    currentStage,
    timeline,
    feedItems,
    onContinue: () => {
      window.location.href = "/me";
    },
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="flex w-full justify-center">
        <div className="flex flex-col items-center gap-4 min-w-[800px]">
          <AgentFeed {...agentFeedProps} />
        </div>
      </div>
    </main>
  );
}
