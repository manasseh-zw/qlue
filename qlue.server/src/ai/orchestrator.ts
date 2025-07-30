import { tasteProfilingAgent, type TasteProfilerAgent } from "./profiler.agent";
import { Events } from "../index";
import { type UserInterests } from "./tools/interests.tool";
import { type QlooEntity } from "../insights/insights.service";
import { prisma } from "../db/db";
import { 
  type AgentStartedEvent, 
  type AgentCompletedEvent,
  type MessageUpdateData,
  type InsightUpdateData,
  type TimelineUpdateData
} from "../notifications/event";

export interface TasteProfileInput {
  name: string;
  age: number;
  gender: string;
  artists: string[];
  podcasts: string[];
  booksShowsMovies: string[];
  hobbiesOther: string[];
  location?: string;
}

export interface TasteProfileResult {
  primaryEntities: {
    resolved: any[];
    failed: any[];
  };
  domainExpansions: {
    [domain: string]: {
      entities: QlooEntity[];
      parentEntity: string;
      reasoning: string;
    };
  };
  crossDomainInsights: {
    pairings: any[];
    results: any[];
  };
  finalAnalysis: string;
  processingTime: number;
  metadata: {
    totalEntitiesResolved: number;
    domainsExpanded: string[];
    crossDomainPairings: number;
    processingStages: string[];
  };
}

class ProfileProcessingOrchestrator {
  private static instance: ProfileProcessingOrchestrator;
  private activeProcessing = new Map<string, boolean>();

  static getInstance(): ProfileProcessingOrchestrator {
    if (!ProfileProcessingOrchestrator.instance) {
      ProfileProcessingOrchestrator.instance = new ProfileProcessingOrchestrator();
    }
    return ProfileProcessingOrchestrator.instance;
  }

  async startAgentProcessing(userId: string, userInterests: UserInterests): Promise<void> {
    if (this.activeProcessing.get(userId)) {
      console.log(`⚠️  Agent processing already active for user: ${userId}`);
      return;
    }

    console.log(`🚀 Starting agent processing for user: ${userId}`);
    this.activeProcessing.set(userId, true);

    try {
      // Send agent started event to trigger client redirect
      const agentStartedData: AgentStartedEvent = {
        message: "🤖 I'm starting to analyze your taste profile! Let me show you what I discover...",
        redirectTo: "/profiler",
        userId
      };

      Events.sendToUser(userId, "agent_started", "agent_started", agentStartedData);
      await this.delay(500); // Small delay to ensure redirect happens

      // Initialize timeline
      this.sendTimelineUpdate(userId, "entity_resolution", [
        { id: "1", text: "Gathering Your Interests", status: "in_progress", type: "question" },
        { id: "2", text: "Resolving Entities", status: "pending", type: "analysis" },
        { id: "3", text: "Expanding Domains", status: "pending", type: "analysis" },
        { id: "4", text: "Cross-Domain Analysis", status: "pending", type: "synthesis" },
        { id: "5", text: "Final Synthesis", status: "pending", type: "synthesis" }
      ]);

      // Convert UserInterests to TasteProfileInput
      const tasteProfileInput: TasteProfileInput = {
        name: userInterests.name,
        age: userInterests.age,
        gender: userInterests.gender,
        artists: userInterests.artists,
        podcasts: userInterests.podcasts,
        booksShowsMovies: userInterests.booksShowsMovies,
        hobbiesOther: userInterests.hobbiesOther,
        location: userInterests.location
      };

      // Start processing with real-time updates
      const result = await this.processWithUpdates(userId, tasteProfileInput);

      // Save results to database
      await this.saveTasteProfileResults(userId, result);

      // Send completion event
      const agentCompletedData: AgentCompletedEvent = {
        message: "✨ Your taste profile is complete! Ready to explore personalized experiences.",
        redirectTo: "/app",
        userId,
        processingTime: result.processingTime
      };

      Events.sendToUser(userId, "agent_completed", "agent_completed", agentCompletedData);

    } catch (error) {
      console.error(`❌ Error in agent processing for user ${userId}:`, error);
      this.sendMessageUpdate(userId, "final_synthesis", 
        "I encountered an issue while processing your profile. Let me try again!", 
        "Error during processing");
    } finally {
      this.activeProcessing.set(userId, false);
    }
  }

  private async processWithUpdates(userId: string, input: TasteProfileInput): Promise<TasteProfileResult> {
    const startTime = Date.now();

    // Stage 1: Entity Resolution
    this.sendMessageUpdate(userId, "entity_resolution", 
      "🔍 Let me parse and categorize your interests across different domains...", 
      "Starting entity resolution process");

    this.updateTimelineStage(userId, "entity_resolution", "1", "completed");
    this.updateTimelineStage(userId, "entity_resolution", "2", "in_progress");

    // Process with profiler agent but capture intermediate results
    const result = await this.processWithIntermediateUpdates(userId, input);

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    return {
      ...result,
      processingTime
    };
  }

  private async processWithIntermediateUpdates(userId: string, input: TasteProfileInput): Promise<Omit<TasteProfileResult, 'processingTime'>> {
    // We'll enhance the profiler agent to support intermediate updates
    // For now, simulate the process with timed updates
    
    const mockResult: Omit<TasteProfileResult, 'processingTime'> = {
      primaryEntities: { resolved: [], failed: [] },
      domainExpansions: {},
      crossDomainInsights: { pairings: [], results: [] },
      finalAnalysis: "",
      metadata: {
        totalEntitiesResolved: 0,
        domainsExpanded: [],
        crossDomainPairings: 0,
        processingStages: ["entity_resolution", "domain_expansion", "cross_domain_insights", "final_synthesis"]
      }
    };

    // Stage 2: Domain Expansion
    await this.delay(2000);
    this.updateTimelineStage(userId, "domain_expansion", "2", "completed");
    this.updateTimelineStage(userId, "domain_expansion", "3", "in_progress");
    
    this.sendMessageUpdate(userId, "domain_expansion", 
      "🌐 Found some interesting patterns! Now expanding into related domains to discover more about your tastes...", 
      "Analyzing domain relationships and expanding preferences");

    // Simulate entity discoveries
    await this.simulateEntityDiscoveries(userId, "domain_expansion");

    // Stage 3: Cross-Domain Analysis  
    await this.delay(2000);
    this.updateTimelineStage(userId, "cross_domain_insights", "3", "completed");
    this.updateTimelineStage(userId, "cross_domain_insights", "4", "in_progress");

    this.sendMessageUpdate(userId, "cross_domain_insights", 
      "🔗 Connecting the dots between your different interests! I'm finding fascinating cross-domain patterns...", 
      "Analyzing connections between music, content, and lifestyle preferences");

    await this.simulateEntityDiscoveries(userId, "cross_domain_insights");

    // Stage 4: Final Synthesis
    await this.delay(1500);
    this.updateTimelineStage(userId, "final_synthesis", "4", "completed");
    this.updateTimelineStage(userId, "final_synthesis", "5", "in_progress");

    this.sendMessageUpdate(userId, "final_synthesis", 
      "✨ Synthesizing everything into your comprehensive taste profile! This is where the magic happens...", 
      "Creating final personalized analysis and recommendations");

    // Generate final profile using the actual agent
    const finalAnalysis = await tasteProfilingAgent.generateTasteProfile(input);
    
    await this.delay(1000);
    this.updateTimelineStage(userId, "final_synthesis", "5", "completed");

    return {
      ...mockResult,
      finalAnalysis
    };
  }

  private async simulateEntityDiscoveries(userId: string, stage: string): Promise<void> {
    const sampleEntities = [
      {
        name: "Taylor Swift",
        entity_id: "artist_taylor_swift",
        properties: {
          description: "American singer-songwriter known for narrative songwriting",
          short_description: "Pop/Country artist",
          popularity: "Very High",
          image: { url: "https://example.com/taylor-swift.jpg" }
        }
      },
      {
        name: "The Joe Rogan Experience", 
        entity_id: "podcast_joe_rogan",
        properties: {
          description: "Long-form conversation podcast",
          short_description: "Comedy/Interview podcast", 
          popularity: "High",
          image: { url: "https://example.com/joe-rogan.jpg" }
        }
      }
    ];

    for (const entity of sampleEntities) {
      await this.delay(1000); // 1 second delay between entities for smooth UX
      
      const insightData: InsightUpdateData = {
        entity,
        context: {
          stage,
          reasoning: `Discovered ${entity.name} as a key influence in your taste profile`,
          domainType: entity.entity_id.includes("artist") ? "music" : "podcasts"
        }
      };

      Events.sendToUser(userId, stage as any, "insight", insightData);
    }
  }

  private sendMessageUpdate(userId: string, stage: string, message: string, reasoning: string): void {
    const messageData: MessageUpdateData = {
      message,
      reasoning,
      stage
    };
    
    Events.sendToUser(userId, stage as any, "message", messageData);
  }

  private sendTimelineUpdate(userId: string, stage: string, timeline: any[]): void {
    const timelineData: TimelineUpdateData = {
      timeline,
      currentStage: stage
    };

    Events.sendToUser(userId, stage as any, "timeline_update", timelineData);
  }

  private updateTimelineStage(userId: string, stage: string, itemId: string, status: "pending" | "in_progress" | "completed"): void {
    // This would update a specific timeline item - for now we'll send a message
    this.sendMessageUpdate(userId, stage, `Stage ${itemId} ${status}`, `Timeline update for ${itemId}`);
  }

  private async saveTasteProfileResults(userId: string, result: TasteProfileResult): Promise<void> {
    try {
      // Create taste profile record
      const tasteProfile = await prisma.tasteProfile.create({
        data: {
          data: result as any // Store as JSON
        }
      });

      // Link to user
      await prisma.user.update({
        where: { id: userId },
        data: {
          tasteProfileId: tasteProfile.id
        }
      });

      console.log(`💾 Saved taste profile results for user: ${userId}`);
    } catch (error) {
      console.error(`❌ Error saving taste profile for user ${userId}:`, error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isProcessing(userId: string): boolean {
    return this.activeProcessing.get(userId) || false;
  }
}

export const orchestrator = ProfileProcessingOrchestrator.getInstance();