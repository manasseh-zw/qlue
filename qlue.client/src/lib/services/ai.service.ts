import { config } from "../../../client.config";

export interface CreateConversationRequest {
  personaId: string;
  replicaId?: string;
  mode: "perfect_pitch" |  "taste_critic" | "adaptive_conversation";
  customGreeting?: string;
}

export interface CreateConversationResponse {
  conversationId: string;
  conversationUrl: string;
  conversationName: string;
  status: string;
}

export const getTasteProfile = async () => {
  try {
    const response = await fetch(`${config.serverUrl}/api/insights/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get taste profile error:", error);
    throw error;
  }
};

export class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  }

  async createConversation(
    request: CreateConversationRequest
  ): Promise<CreateConversationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/tavus/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create conversation");
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to create conversation:", error);
      throw error;
    }
  }

  async getConversation(
    conversationId: string
  ): Promise<CreateConversationResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/ai/tavus/conversation/${conversationId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get conversation");
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get conversation:", error);
      throw error;
    }
  }

  async endConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/ai/tavus/conversation/${conversationId}/end`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to end conversation");
      }
    } catch (error) {
      console.error("Failed to end conversation:", error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/ai/tavus/conversation/${conversationId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete conversation");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      throw error;
    }
  }
}
