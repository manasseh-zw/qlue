import React, { useState } from "react";
import { Button } from "@heroui/react";
import { Phone } from "lucide-react";
import {
  AIService,
  type CreateConversationRequest,
} from "../../lib/services/ai.service";
import { useNavigate } from "@tanstack/react-router";

interface ConversationProps {
  persona: {
    personaId: string;
    replicaId?: string;
    mode: "perfect_pitch" | "taste_critic" | "adaptive_conversation";
    title: string;
  };
}

export function StartConversation({ persona }: ConversationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aiService = new AIService();
  const navigate = useNavigate();

  const createConversation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const request: CreateConversationRequest = {
        personaId: persona.personaId,
        replicaId: persona.replicaId,
        mode: persona.mode,
      };

      const response = await aiService.createConversation(request);

      // Navigate to meet page with conversation URL
      navigate({
        to: "/meet",
        search: { url: response.conversationUrl },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create conversation"
      );
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-600 mb-4">
          <Phone className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Connection Failed</p>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
        </div>
        <Button
          color="primary"
          onPress={createConversation}
          isLoading={isLoading}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <Button
      className="py-6 w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-300 group-hover:scale-105"
      size="lg"
      radius="full"
      startContent={<Phone className="w-6 h-6" />}
      onPress={createConversation}
      isLoading={isLoading}
    >
      {isLoading ? "Creating Conversation..." : "Start Conversation"}
    </Button>
  );
}
