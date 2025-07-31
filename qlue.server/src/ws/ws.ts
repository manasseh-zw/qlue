import type { ServerWebSocket } from "bun";
import { createBunWebSocket } from "hono/bun";
import { WebSocketManager } from "./ws-manager";
import { EventType } from "./event";
import { simulateProfilerUpdates, stopProfilerSimulation } from "./test-profiler";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

export function createWebSocketHandler() {
  const wsManager = WebSocketManager.getInstance();

  return {
    upgradeWebSocket,
    websocket,

    handler: (c: any) => {
      const userId = c.req.param("userId");

      return {
        onOpen: (evt: any, ws: any) => {
          console.log(`🔌 New WebSocket connection for user: ${userId}`);
          wsManager.addConnection(userId, ws.raw as ServerWebSocket);

          // Send connection confirmation
          ws.send(
            JSON.stringify({
              id: `conn_${Date.now()}`,
              type: "connected" as EventType,
              data: { message: "WebSocket connected", userId },
              timestamp: Date.now(),
            })
          );
        },

        onMessage: (evt: any, ws: any) => {
          try {
            const message = JSON.parse(evt.data.toString());

            // Handle incoming messages from client
            switch (message.type) {
              case "ping":
                ws.send(
                  JSON.stringify({
                    id: `pong_${Date.now()}`,
                    type: "pong" as EventType,
                    data: { timestamp: Date.now() },
                    timestamp: Date.now(),
                  })
                );
                break;

              case "subscribe":
                // Handle channel subscriptions
                console.log("User subscribed to channel:", message.channel);
                break;

              case "test_profiler":
                // 🧪 TEST ENDPOINT: Simulate profiler agent updates
                console.log("🧪 Test profiler triggered for user:", userId);
                simulateProfilerUpdates(userId, ws);
                break;

              case "stop_test_profiler":
                // 🛑 Stop the test profiler loop
                console.log("🛑 Test profiler stopped for user:", userId);
                stopProfilerSimulation(userId);
                break;

              default:
                console.log("Unknown message type:", message.type);
            }
          } catch (error) {
            console.error("Invalid message format:", error);
          }
        },

        onClose: (evt: any, ws: any) => {
          wsManager.removeConnection(userId, ws.raw as ServerWebSocket);
          console.log(
            `🔌 WebSocket closed for user: ${userId}, code: ${evt.code}, reason: ${evt.reason}`
          );
        },

        onError: (evt: any, ws: any) => {
          console.error("WebSocket error:", evt);
          wsManager.removeConnection(userId, ws.raw as ServerWebSocket);
        },
      };
    },
  };
}
