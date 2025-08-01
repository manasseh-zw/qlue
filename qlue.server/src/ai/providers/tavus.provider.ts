import { config } from "../../../server.config";

export interface TavusConversationRequest {
  replica_id?: string;
  persona_id: string;
  audio_only?: boolean;
  callback_url?: string;
  conversation_name?: string;
  conversational_context?: string;
  custom_greeting?: string;
  properties?: {
    max_call_duration?: number;
    participant_left_timeout?: number;
    participant_absent_timeout?: number;
    enable_recording?: boolean;
    enable_closed_captions?: boolean;
    language?: string;
    apply_greenscreen?: boolean;
  };
}

export interface TavusConversationResponse {
  conversation_id: string;
  conversation_name: string;
  status: string;
  conversation_url: string;
  replica_id: string;
  persona_id: string;
  created_at: string;
}

export interface TavusError {
  error?: string;
  message?: string;
}

export class TavusProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = config.tavus.apiKey || "";
    this.baseUrl = config.tavus.url || "https://tavusapi.com";
    
    if (!this.apiKey) {
      console.warn("TAVUS_API_KEY is not set. Tavus conversations will not work.");
    }
  }

  async createConversation(
    request: TavusConversationRequest
  ): Promise<TavusConversationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData: TavusError = await response.json();
        throw new Error(
          errorData.error || errorData.message || `HTTP ${response.status}`
        );
      }

      const data: TavusConversationResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Tavus API error:", error);
      throw new Error(
        `Failed to create Tavus conversation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getConversation(conversationId: string): Promise<TavusConversationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/conversations/${conversationId}`, {
        method: "GET",
        headers: {
          "x-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        const errorData: TavusError = await response.json();
        throw new Error(
          errorData.error || errorData.message || `HTTP ${response.status}`
        );
      }

      const data: TavusConversationResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Tavus API error:", error);
      throw new Error(
        `Failed to get Tavus conversation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async endConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/conversations/${conversationId}/end`, {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        const errorData: TavusError = await response.json();
        throw new Error(
          errorData.error || errorData.message || `HTTP ${response.status}`
        );
      }
    } catch (error) {
      console.error("Tavus API error:", error);
      throw new Error(
        `Failed to end Tavus conversation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/conversations/${conversationId}`, {
        method: "DELETE",
        headers: {
          "x-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        const errorData: TavusError = await response.json();
        throw new Error(
          errorData.error || errorData.message || `HTTP ${response.status}`
        );
      }
    } catch (error) {
      console.error("Tavus API error:", error);
      throw new Error(
        `Failed to delete Tavus conversation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
} 