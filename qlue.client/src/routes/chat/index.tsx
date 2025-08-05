import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { config } from "../../../client.config";
import Avatar from "boring-avatars";
import Markdown from "react-markdown";
import ChatPromptForm from "../../components/chat/chat-prompt-form";
import { Thinking } from "../../components/chat/thinking";
import Logo from "../../components/logo";
import { authenticatedOnlyLoader } from "../../lib/loaders/auth.loaders";
import { authState } from "../../lib/state/auth.state";

export const Route = createFileRoute("/chat/")({
  component: RouteComponent,
  loader: authenticatedOnlyLoader,
});

function RouteComponent() {
  const { user } = authState.state;
  const url = `${config.serverUrl}/api/ai`;
  const [isInitializing, setIsInitializing] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, append, status } = useChat({
    api: url,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
    onFinish: (message) => {
      console.log("Chat finished:", message);
    },
    onToolCall: async ({ toolCall }) => {
      console.log("🔧 Tool called:", toolCall.toolName);

      // Check if the interests tool was called
      if (toolCall.toolName === "saveUserInterests") {
        console.log("🚀 Interests tool called, redirecting to profiler...");

        // Small delay to let the user see the tool is being called
        setTimeout(() => {
          window.location.href = "/profiler";
        }, 500);
      }
      
    },
  });

  useEffect(() => {
    if (status === "streaming") {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, status]);

  useEffect(() => {
    if (messages.length === 0 && isInitializing) {
      setIsInitializing(false);
      append({ role: "user", content: "start_conversation" });
    }
  }, [append, messages.length, isInitializing]);

  const handleSendMessage = (message: string) => {
    append({ role: "user", content: message });
  };

  const displayMessages = messages.filter(
    (msg) => msg.content !== "start_conversation"
  );

  return (
    <main className="h-screen w-full bg-content1 py-10">
      <div className="flex flex-col h-full w-full max-w-3xl mx-auto relative">
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-content1 to-transparent z-10 pointer-events-none" />

        <div className="flex-1 p-4 space-y-9 font-rubik text-zinc-800 overflow-y-auto scrollbar-hide">
          {displayMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              } items-start gap-3`}
            >
              <div className="flex-shrink-0">
                {message.role === "assistant" ? (
                  <div className="p-1 rounded-full">
                    <Logo width={34} height={34} />
                  </div>
                ) : (
                  <div className="p-1 rounded-full">
                    <Avatar
                      name={user?.name ?? "you"}
                      size={38}
                      variant="beam"
                      colors={[
                        "#92A1C6",
                        "#146A7C",
                        "#F0AB3D",
                        "#C271B4",
                        "#C20D90",
                      ]}
                    />
                  </div>
                )}
              </div>
              <div
                className={`flex flex-col ${
                  message.role === "user" ? "items-end" : "items-start"
                } flex-1 overflow-hidden`}
              >
                <div
                  className={
                    message.role === "user"
                      ? "rounded-2xl bg-content3 p-3 max-w-[85%] break-words"
                      : "text-base max-w-[90%]"
                  }
                >
                  {message.role === "assistant" ? (
                    <Markdown>{message.content}</Markdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            </div>
          ))}

          {(status === "submitted" ||
            (isInitializing && messages.length === 0)) && (
            <div className="flex flex-row items-center gap-3">
              <div className="flex-shrink-0">
                <div className="p-1 rounded-full">
                  <Logo width={34} height={34} />
                </div>
              </div>
              <Thinking />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="sticky bottom-[0px] w-full px-6 md:px-12 pt-3 pb-3 bg-content1 z-20">
          <ChatPromptForm onSendMessage={handleSendMessage} />
        </div>
      </div>
    </main>
  );
}
