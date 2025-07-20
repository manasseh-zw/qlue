import React from "react";
import { Button, Chip, cn, Tooltip } from "@heroui/react";
import ChatPromptInput from "./chat-prompt-input";
import { ArrowUp } from "lucide-react";
import Logo from "../logo";

interface ChatPromptFormProps {
  onSendMessage: (message: string) => void;
}

export default function ChatPromptForm({ onSendMessage }: ChatPromptFormProps) {
  const [prompt, setPrompt] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt) {
      onSendMessage(trimmedPrompt);
      setPrompt("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.ctrlKey) {
      e.preventDefault();
      const trimmedPrompt = prompt.trim();
      if (trimmedPrompt) {
        onSendMessage(trimmedPrompt);
        setPrompt("");
      }
    }
  };

  return (
    <div className="relative w-full">
      {/* Glow Element: Positioned behind the form */}
      <div
        className="absolute -inset-0.5 rounded-3xl z-0 bg-gradient-to-r from-violet-200 via-teal-100 to-purple-300 blur-md opacity-40"
        aria-hidden="true"
      />
      <form
        className="relative z-10 flex w-full flex-col items-start bg-white rounded-3xl overflow-hidden shadow-[0_2px_4px_0_rgba(0,0,0,0.08)] hover:border-1 focus:border-gray-100"
        onSubmit={handleSubmit}
      >
        <div className="w-full">
          <ChatPromptInput
            value={prompt}
            onValueChange={setPrompt}
            onKeyDown={handleKeyDown}
            initialRows={2}
            maxHeightRem={10}
            placeholder="Type your message..."
          />
        </div>

        <div className="flex w-full items-center justify-between px-3 pb-2 bg-white">
          <div className="flex items-center gap-2">
            <Chip
              startContent={<Logo width={16} height={16} />}
              classNames={{
                base: "cursor-pointer",
              }}
              variant="light"
              size="sm"
            >
              Qlue
            </Chip>
          </div>
          <Tooltip showArrow content="Send message">
            <Button
              isIconOnly
              color={!prompt.trim() ? "default" : "primary"}
              isDisabled={!prompt.trim()}
              radius="full"
              size="sm"
              variant={!prompt.trim() ? "flat" : "solid"}
              type="submit"
              className="bg-black text-white"
            >
              <ArrowUp
                className={cn(
                  "[&>path]:stroke-[2px]",
                  !prompt.trim() ? "text-default-600" : "text-white"
                )}
                width={18}
              />
            </Button>
          </Tooltip>
        </div>
      </form>
    </div>
  );
}
