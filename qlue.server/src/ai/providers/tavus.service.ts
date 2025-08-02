import { TavusProvider, TavusConversationRequest, TavusConversationResponse } from "./tavus.provider";
import { TasteProfileResult } from "../agents/profiler.agent";

export interface CreateConversationRequest {
  userId: string;
  personaId: string;
  replicaId?: string;
  mode: "perfect_pitch" | "taste_critic" | "adaptive_conversation";
}

export interface CreateConversationResponse {
  conversationId: string;
  conversationUrl: string;
  conversationName: string;
  status: string;
}

export class TavusService {
  private tavusProvider: TavusProvider;

  constructor() {
    this.tavusProvider = new TavusProvider();
  }

  async createConversation(
    request: CreateConversationRequest,
    tasteProfile: TasteProfileResult
  ): Promise<CreateConversationResponse> {

    const conversationalContext = this.generateConversationalContext(tasteProfile);
    const customGreeting = this.generateCustomGreeting(request.mode, tasteProfile);

    const tavusRequest: TavusConversationRequest = {
      persona_id: request.personaId,
      replica_id: request.replicaId,
      conversation_name: this.generateConversationName(request.mode),
      conversational_context: conversationalContext,
      custom_greeting: customGreeting,
      properties: {
        max_call_duration: 300,
        participant_left_timeout: 20,
        participant_absent_timeout: 30,
        enable_closed_captions: true,
        language: "English",
      },
    };

    try {
      const response = await this.tavusProvider.createConversation(tavusRequest);
      
      return {
        conversationId: response.conversation_id,
        conversationUrl: response.conversation_url,
        conversationName: response.conversation_name,
        status: response.status,
      };
    } catch (error) {
      console.error("Failed to create Tavus conversation:", error);
      throw error;
    }
  }

  async getConversation(conversationId: string): Promise<TavusConversationResponse> {
    return this.tavusProvider.getConversation(conversationId);
  }

  async endConversation(conversationId: string): Promise<void> {
    return this.tavusProvider.endConversation(conversationId);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    return this.tavusProvider.deleteConversation(conversationId);
  }

  private generateConversationalContext(tasteProfile: TasteProfileResult): string {
    const primaryEntities = tasteProfile.primaryEntities
      .map(entity => entity.name)
      .join(", ");

    const domainExpansions = Object.entries(tasteProfile.domainExpansions)
      .map(([domain, entities]) => {
        const entityNames = entities.map(e => e.name).join(", ");
        return `${domain}: ${entityNames}`;
      })
      .join("; ");

    const crossDomainInsights = tasteProfile.crossDomainInsights
      .map(insight => `${insight.pairing.sourceDomain} → ${insight.pairing.targetDomain}: ${insight.pairing.reasoning}`)
      .join("; ");

    return `USER TASTE PROFILE:

Primary Interests: ${primaryEntities}

Domain Expansions: ${domainExpansions}

Cross-Domain Insights: ${crossDomainInsights}

Final Analysis: ${tasteProfile.finalAnalysis}

Use this information to create personalized, engaging conversations that reflect the user's unique cultural preferences and personality traits.`;
  }

  private generateCustomGreeting(mode: string, tasteProfile: TasteProfileResult): string {
    const primaryInterest = tasteProfile.primaryEntities[0]?.name || "your interests";
    
    switch (mode) {
      case "perfect_pitch":
        return `Hey there! I've been looking at your taste profile and I'm genuinely excited to chat with someone who appreciates ${primaryInterest} as much as you do. I think we're going to have a great conversation about how we can find the perfect solutions for you.`;
      
      case "taste_critic":
        return `Hello! I'm fascinated by your cultural choices, especially your love for ${primaryInterest}. I'd love to dive deep into what makes your taste profile so unique and explore some connections you might not have considered yet.`;
      
      case "adaptive_conversation":
        return `Hi! I noticed you're into ${primaryInterest} - that's really cool! I'd love to chat about your interests and maybe discover some new things together. What's on your mind today?`;
      
      default:
        return `Hello! I'm excited to chat with you about your interests, especially ${primaryInterest}. How are you doing today?`;
    }
  }

  private generateConversationName(mode: string): string {
    switch (mode) {
      case "perfect_pitch":
        return "Perfect Pitch Session";
      case "taste_critic":
        return "Taste Analysis & Discovery";
      case "adaptive_conversation":
        return "Personalized Chat";
      default:
        return "Qlue Conversation";
    }
  }
} 