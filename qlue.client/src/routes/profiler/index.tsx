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
  const [feedItems, setFeedItems] = useState<
    Array<{
      type: "message" | "insight";
      data: MessageData | InsightData;
      id: string;
    }>
  >([]);
  const [isTestRunning, setIsTestRunning] = useState(false);

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
          // case "agent_completed":
          //   // Redirect to app page
          //   setTimeout(() => {
          //     window.location.href = "/app";
          //   }, 2000);
          //   break;

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

  const triggerTestProfiler = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("🧪 Triggering test profiler...");
      setIsTestRunning(true);

      // Reset state for clean test
      setTimeline([
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
        {
          id: "3",
          text: "Expanding Domains",
          status: "pending",
          type: "analysis",
        },
        {
          id: "4",
          text: "Cross-Domain Analysis",
          status: "pending",
          type: "synthesis",
        },
        {
          id: "5",
          text: "Final Synthesis",
          status: "pending",
          type: "synthesis",
        },
      ]);
      setFeedItems([]);
      setCurrentStage("Initializing...");

      ws.send(
        JSON.stringify({
          type: "test_profiler",
          timestamp: Date.now(),
        })
      );
    } else {
      console.error("❌ WebSocket not connected");
    }
  };

  const stopTestProfiler = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("🛑 Stopping test profiler...");
      setIsTestRunning(false);
      ws.send(
        JSON.stringify({
          type: "stop_test_profiler",
          timestamp: Date.now(),
        })
      );
    } else {
      console.error("❌ WebSocket not connected");
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const agentFeedProps = {
    currentStage,
    timeline,
    feedItems,
    onContinue: () => {
      // Navigate to the app page when user clicks continue
      window.location.href = "/app";
    },
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="flex w-full justify-center">
        <div className="flex flex-col items-center gap-4 min-w-[800px]">
          {/* 🧪 Test Buttons - Only show in test mode */}
          {config.testMode && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={triggerTestProfiler}
                disabled={!isConnected || isTestRunning}
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🧪 Start Test Loop
              </button>

              {isTestRunning && (
                <button
                  onClick={stopTestProfiler}
                  disabled={!isConnected}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🛑 Stop Test Loop
                </button>
              )}
            </div>
          )}

          <AgentFeed {...agentFeedProps} />
        </div>
      </div>
    </main>
  );
}
