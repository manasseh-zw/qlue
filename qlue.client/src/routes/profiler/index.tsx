import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { authState } from "@/lib/state/auth.state";
import { protectedLoader } from "@/lib/loaders/auth.loaders";
import AgentFeed from "@/components/chat/feed/agent-feed";
import { useEffect, useState } from "react";
import { config } from "../../../client.config";
import type { TimelineItem } from "../../components/chat/feed/types";

export const Route = createFileRoute("/profiler/")({
  component: RouteComponent,
  loader: protectedLoader,
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
  const { user } = useStore(authState);
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
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);

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
          case "agent_completed":
            // Redirect to app page
            setTimeout(() => {
              window.location.href = "/app";
            }, 2000);
            break;

          case "message":
            setCurrentStage(message.data.message);
            setMessages((prev) => [...prev, message.data]);
            break;

          case "insight":
            setInsights((prev) => [...prev, message.data]);
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
    insights,
    messages,
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="flex w-full justify-center">
        <AgentFeed {...agentFeedProps} />
      </div>
    </main>
  );
}
