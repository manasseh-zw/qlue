import ChatPromptForm from "@/components/chat/chat-prompt-form";
import { Markdown } from "@/components/chat/markdown";
import { Thinking } from "@/components/chat/thinking";
import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { Avatar as UserAvatar } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { config } from "../../../client.config";
import Logo from "@/components/logo";
import { useStore } from "@tanstack/react-store";
import { authState } from "@/lib/state/auth.state";
import { protectedLoader } from "@/lib/loaders/auth.loaders";

export const Route = createFileRoute("/chat/")({
  component: RouteComponent,
  loader: protectedLoader,
});

function RouteComponent() {
  const { user } = useStore(authState);
  const url = `${config.serverUrl}/api/chat`;
  const [isInitializing, setIsInitializing] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, append, status } = useChat({
    api: url,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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
                    <UserAvatar name={user?.name || "You"} src={user?.image} />
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
                      ? "rounded-2xl bg-content2 p-3 max-w-[85%] break-words"
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
            <div
              className="flex flex-row items-cente
           r gap-3"
            >
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
