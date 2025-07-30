import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { authState } from "@/lib/state/auth.state";
import { protectedLoader } from "@/lib/loaders/auth.loaders";
import AgentFeed from "@/components/chat/feed/agent-feed";
import { useEffect, useState } from "react";
import { config } from "../../../client.config";

export const Route = createFileRoute("/profiler/")({
  component: RouteComponent,
  loader: protectedLoader,
});

interface TimelineItem {
  id: string;
  text: string;
  status: "pending" | "in_progress" | "completed";
  type: "question" | "analysis" | "synthesis";
}

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
    { id: "1", text: "Gathering Your Interests", status: "pending", type: "question" },
    { id: "2", text: "Resolving Entities", status: "pending", type: "analysis" },
    { id: "3", text: "Expanding Domains", status: "pending", type: "analysis" },
    { id: "4", text: "Cross-Domain Analysis", status: "pending", type: "synthesis" },
    { id: "5", text: "Final Synthesis", status: "pending", type: "synthesis" }
  ]);
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    // Create WebSocket connection
    const wsUrl = `${config.serverUrl.replace('http', 'ws')}/ws/${user.id}`;
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
            setMessages(prev => [...prev, message.data]);
            break;

          case "insight": 
            setInsights(prev => [...prev, message.data]);
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
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [user?.id]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const agentFeedProps = {
    agentName: "Qlue AI",
    agentAvatar: "/api/placeholder-avatar",
    currentStage,
    timeline,
    insights,
    messages
  };

  return (
    <main className="min-h-screen bg-content1 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Building Your Taste Profile
          </h1>
          <p className="text-default-600">
            Watch as I analyze your preferences and discover your unique taste patterns
          </p>
          {/* Connection status */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div 
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-default-500">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Agent Feed Component */}
        <div className="flex justify-center">
          <AgentFeed {...agentFeedProps} />
        </div>

        {/* Current Status */}
        <div className="text-center mt-6">
          <p className="text-sm text-default-600">
            Current Status: {currentStage}
          </p>
        </div>
      </div>
    </main>
  );
}