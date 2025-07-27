import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { TASTE_PROFILING_AGENT_PROMPT } from "./prompts";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { resolveEntities, getInsights, crossDomainProfile } from "../services/taste.service";

// Define the input type based on what we expect from the user
interface TasteProfileInput {
  name: string;
  age: number;
  gender: string;
  music: string[];
  podcasts: string[];
  booksShowsMovies: string[];
  hobbiesOther: string[];
  location?: string;
}

export class TasteProfilingAgent {
  private model = anthropic("claude-4-sonnet-20250514");

  async generateTasteProfile(input: TasteProfileInput): Promise<string> {
    console.log("🤖 TasteProfilingAgent: Starting structured taste profile generation");
    console.log("📊 Input data:", JSON.stringify(input, null, 2));
    
    try {
      const startTime = Date.now();
      
      // Step 1: Parse and categorize user input into entity resolution requests
      console.log("🔄 Step 1: Parsing and categorizing user input...");
      const categorizedEntities = await this.parseUserInput(input);
      console.log("✅ Step 1 completed:", categorizedEntities);
      
      // Step 2: Resolve all entities to get IDs and metadata
      console.log("🔄 Step 2: Resolving entities...");
      const resolvedEntities = await this.resolveEntities(categorizedEntities);
      console.log("✅ Step 2 completed:", resolvedEntities);
      
      // Step 3: Domain expansion using resolved entities
      console.log("🔄 Step 3: Expanding within domains...");
      const domainExpansions = await this.expandDomains(resolvedEntities, input);
      console.log("✅ Step 3 completed:", domainExpansions);
      
      // Step 4: Identify optimal domain pairings
      console.log("🔄 Step 4: Identifying domain pairings...");
      const domainPairings = await this.identifyDomainPairings(resolvedEntities, domainExpansions);
      console.log("✅ Step 4 completed:", domainPairings);
      
      // Step 5: Cross-domain insights based on pairings
      console.log("🔄 Step 5: Generating cross-domain insights...");
      const crossDomainInsights = await this.generateCrossDomainInsights(resolvedEntities, domainPairings, input);
      console.log("✅ Step 5 completed:", crossDomainInsights);
      
      // Step 6: Final synthesis and analysis
      console.log("🔄 Step 6: Final synthesis and analysis...");
      const finalProfile = await this.synthesizeProfile(resolvedEntities, domainExpansions, crossDomainInsights, input);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log("✅ Taste profile generation completed successfully");
      console.log(`⏱️  Total processing time: ${duration}ms`);
      console.log("📝 Generated taste profile length:", finalProfile.length, "characters");
      console.log("🎯 Taste profile preview:", finalProfile.substring(0, 200) + "...");
      
      return finalProfile;
    } catch (error) {
      console.error("❌ Error in taste profile generation:", error);
      throw error;
    }
  }

  private async parseUserInput(input: TasteProfileInput) {
    const { object } = await generateObject({
      model: this.model,
      schema: z.object({
        music: z.array(z.object({
          query: z.string(),
          type: z.literal("artist")
        })),
        movies: z.array(z.object({
          query: z.string(),
          type: z.literal("movie")
        })),
        tv_shows: z.array(z.object({
          query: z.string(),
          type: z.literal("tv_show")
        })),
        books: z.array(z.object({
          query: z.string(),
          type: z.literal("book")
        })),
        podcasts: z.array(z.object({
          query: z.string(),
          type: z.literal("podcast")
        })),
        brands: z.array(z.object({
          query: z.string(),
          type: z.literal("brand")
        }))
      }),
      system: `You are an expert at categorizing user interests into structured entity data. 
      Given user input, extract and categorize all entities by their type.
      
      Be smart about categorization:
      - "Jurassic Park" is a movie
      - "Game of Thrones" is a tv_show  
      - "Whitney Houston" is an artist
      - "Founders" is a podcast
      - Programming/software terms go to brands if they're companies, otherwise skip
      
      Return only the entities that can be resolved to actual media/content.`,
      prompt: `Categorize these user interests into structured entities: ${JSON.stringify(input, null, 2)}`,
    });

    return object;
  }

  private async resolveEntities(categorizedEntities: any) {
    const allEntities: any[] = [];
    
    // Flatten all categorized entities into a single array
    for (const [category, entities] of Object.entries(categorizedEntities)) {
      if (Array.isArray(entities)) {
        allEntities.push(...entities);
      }
    }

    if (allEntities.length === 0) {
      return { success: true, resolved: [], total: 0, successful: 0 };
    }

    console.log("🔍 Resolving entities:", allEntities);
    const result = await resolveEntities(allEntities);
    return result;
  }

  private async expandDomains(resolvedEntities: any, input: TasteProfileInput) {
    const domainExpansions: any = {};
    
    // Group resolved entities by type
    const entitiesByType = this.groupEntitiesByType(resolvedEntities.resolved);
    
    // Expand each domain using resolved entities
    for (const [entityType, entities] of Object.entries(entitiesByType)) {
      if (Array.isArray(entities) && entities.length > 0) {
        const entityIds = entities.map((e: any) => e.resolved?.entity_id).filter(Boolean);
        const tags = entities.flatMap((e: any) => e.resolved?.tags?.map((t: any) => t.tag_id) || []).filter(Boolean);
        
        if (entityIds.length > 0) {
          console.log(`💡 Expanding ${entityType} domain with ${entityIds.length} entities`);
          const result = await getInsights({
            entityIds,
            tags: tags.length > 0 ? tags : undefined,
            outputType: entityType,
            age: input.age?.toString(),
            gender: input.gender,
          });
          
          domainExpansions[entityType] = result;
        }
      }
    }
    
    return domainExpansions;
  }

  private async identifyDomainPairings(resolvedEntities: any, domainExpansions: any) {
    const { object } = await generateObject({
      model: this.model,
      schema: z.array(z.object({
        sourceDomain: z.string(),
        targetDomain: z.string(),
        reasoning: z.string(),
        sourceEntities: z.array(z.string())
      })),
      system: `You are an expert at identifying optimal domain pairings for taste profiling.
      
      Based on the resolved entities and domain expansions, identify which domain combinations would yield the best cross-domain insights.
      
      Consider these proven domain pairings:
      - Podcast tastes → Book recommendations (high correlation)
      - TV show preferences → Movie recommendations (similar storytelling)
      - Book preferences → Movie/TV adaptations (source material)
      - Music tastes → Brand preferences (lifestyle alignment)
      - Movie preferences → TV show recommendations (genre alignment)
      
      Only suggest pairings where you have source entities available.`,
      prompt: `Identify optimal domain pairings for cross-domain insights:
      
      Resolved Entities: ${JSON.stringify(resolvedEntities, null, 2)}
      Domain Expansions: ${JSON.stringify(domainExpansions, null, 2)}`,
    });

    return object;
  }

  private async generateCrossDomainInsights(resolvedEntities: any, domainPairings: any, input: TasteProfileInput) {
    const crossDomainResults = [];
    
    for (const pairing of domainPairings) {
      console.log(`🌐 Cross-domain search: ${pairing.sourceDomain} → ${pairing.targetDomain}`);
      const result = await crossDomainProfile({
        entities: pairing.sourceEntities.map((id: string) => {
          const entity = resolvedEntities.resolved.find((e: any) => e.resolved?.entity_id === id);
          return { query: entity?.input?.query || "", type: entity?.input?.type || "" };
        }),
        domains: [pairing.targetDomain],
        demographics: {
          age: input.age?.toString(),
          gender: input.gender,
        },
        location: input.location ? { query: input.location } : undefined,
      });
      
      crossDomainResults.push({
        pairing,
        result,
      });
    }
    
    return crossDomainResults;
  }

  private async synthesizeProfile(resolvedEntities: any, domainExpansions: any, crossDomainInsights: any, input: TasteProfileInput) {
    const { text } = await generateText({
      model: this.model,
      system: TASTE_PROFILING_AGENT_PROMPT,
      prompt: `Create a comprehensive taste profile based on all the collected data:
      
      User Input: ${JSON.stringify(input, null, 2)}
      Resolved Entities: ${JSON.stringify(resolvedEntities, null, 2)}
      Domain Expansions: ${JSON.stringify(domainExpansions, null, 2)}
      Cross-Domain Insights: ${JSON.stringify(crossDomainInsights, null, 2)}
      
      Synthesize all this information into a comprehensive, personalized taste profile that includes:
      1. Key insights about the user's taste patterns
      2. Specific recommendations across all domains
      3. Cross-domain connections and insights
      4. Personalized analysis and observations`,
    });

    return text;
  }

  private groupEntitiesByType(resolvedEntities: any[]) {
    const grouped: any = {};
    
    for (const entity of resolvedEntities) {
      if (entity.resolved) {
        const type = entity.input.type;
        if (!grouped[type]) {
          grouped[type] = [];
        }
        grouped[type].push(entity);
      }
    }
    
    return grouped;
  }
}

export const tasteProfilingAgent = new TasteProfilingAgent();
