import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { TASTE_PROFILING_AGENT_PROMPT } from "./prompts";
import { z } from "zod";

import { azure, createAzure } from "@ai-sdk/azure";
import {
  QlooEntity,
  CrossDomainProfileResult,
  ResolvedEntity,
  EntityResolutionRequest,
  resolveEntities,
  getInsights,
  crossDomainProfileByIds,
} from "../../insights/insights.service";
import { AgentUpdates } from "../events/event";

// Type definitions for type safety
export type Demographics = {
  age: "35_and_younger" | "36_to_55" | "55_and_older";
  gender: "male" | "female";
  location?: {
    query: string;
  };
};

export type NormalizedTasteInput = {
  entities: {
    music: Array<{ query: string; type: "artist" }>;
    movies: Array<{ query: string; type: "movie" }>;
    tv_shows: Array<{ query: string; type: "tv_show" }>;
    books: Array<{ query: string; type: "book" }>;
    podcasts: Array<{ query: string; type: "podcast" }>;
    brands: Array<{ query: string; type: "brand" }>;
    destinations: Array<{ query: string; type: "destination" }>;
    places: Array<{ query: string; type: "place" }>;
    people: Array<{ query: string; type: "person" }>;
    videogames: Array<{ query: string; type: "videogame" }>;
  };
  demographics: Demographics;
};

export type DomainPairing = {
  sourceDomain: string;
  targetDomain: string;
  reasoning: string;
  sourceEntities: Array<{
    id: string;
    name: string;
  }>;
};

export type DomainExpansions = {
  [domain: string]: QlooEntity[];
};

export type CrossDomainInsight = {
  pairing: DomainPairing;
  result: CrossDomainProfileResult;
};

interface TasteProfileInput {
  name: string;
  age: number;
  gender: string;
  artists: string[];
  podcasts: string[];
  booksShowsMovies: string[];
  hobbiesOther: string[];
  location?: string;
  userId?: string;
}

export type TasteProfileResult = {
  primaryEntities: QlooEntity[];
  domainExpansions: DomainExpansions;
  crossDomainInsights: CrossDomainInsight[];
  finalAnalysis: string;
};

export class TasteProfilerAgent {
  azure = createAzure();
  private model = azure.languageModel("gpt-4.1");

  async generateTasteProfile(
    input: TasteProfileInput
  ): Promise<TasteProfileResult> {
    console.log(
      "🤖 TasteProfilingAgent: Starting structured taste profile generation"
    );
    console.log("📊 Input data:", JSON.stringify(input, null, 2));

    try {
      const startTime = Date.now();
      const userId = input.userId;

      // Step 1: Parse and categorize user input into entity resolution requests
      console.log("🔄 Step 1: Parsing and categorizing user input...");
      await AgentUpdates.sendMessage(
        userId!,
        "I'm analyzing your interests and categorizing them for deeper exploration...",
        "Processing your input to understand what types of entities we're working with",
        "entity_resolution"
      );
      
      const normalizedTasteInput = await this.parseUserInput(input);
      console.log("✅ Step 1 completed:", normalizedTasteInput);

      // Update timeline after Step 1
      await AgentUpdates.sendTimelineUpdate(
        userId!,
        [
          {
            id: "1",
            text: "Gathering Your Interests",
            status: "completed",
            type: "question",
          },
          {
            id: "2",
            text: "Resolving Entities",
            status: "in_progress",
            type: "analysis",
          },
          {
            id: "3",
            text: "Expanding Domains",
            status: "pending",
            type: "analysis",
          },
          {
            id: "4",
            text: "Cross-Domain Analysis",
            status: "pending",
            type: "synthesis",
          },
          {
            id: "5",
            text: "Final Synthesis",
            status: "pending",
            type: "synthesis",
          },
        ],
        "Resolving Entities"
      );

      // Step 2: Resolve all entities to get IDs and metadata
      console.log("🔄 Step 2: Resolving entities...");
      await AgentUpdates.sendMessage(
        userId!,
        "Now I'm resolving your interests to get detailed information about each one...",
        "Looking up each entity in our cultural intelligence database",
        "entity_resolution"
      );
      
      const resolvedEntities = await this.resolveEntities(normalizedTasteInput);
      console.log("✅ Step 2 completed:", resolvedEntities);

      // Stream resolved entities to client
      if (resolvedEntities.successful > 0) {
        await AgentUpdates.sendMessage(
          userId!,
          `Great! I found detailed information for ${resolvedEntities.successful} of your interests. Let me show you what I discovered...`,
          "Successfully resolved entities with cultural intelligence data",
          "entity_resolution"
        );

        // Stream each resolved entity with delay
        for (let i = 0; i < resolvedEntities.resolved.length; i++) {
          const entity = resolvedEntities.resolved[i];
          if (entity.resolved) {
            await AgentUpdates.sendInsightUpdate(
              userId!,
              entity.resolved,
              {
                stage: "entity_resolution",
                reasoning: `Found detailed information about ${entity.input.query}`,
                domainType: entity.input.type,
              },
              i === 0 ? 0 : 1000
            );
          }
        }
      }

      // Update timeline after Step 2
      await AgentUpdates.sendTimelineUpdate(
        userId!,
        [
          {
            id: "1",
            text: "Gathering Your Interests",
            status: "completed",
            type: "question",
          },
          {
            id: "2",
            text: "Resolving Entities",
            status: "completed",
            type: "analysis",
          },
          {
            id: "3",
            text: "Expanding Domains",
            status: "in_progress",
            type: "analysis",
          },
          {
            id: "4",
            text: "Cross-Domain Analysis",
            status: "pending",
            type: "synthesis",
          },
          {
            id: "5",
            text: "Final Synthesis",
            status: "pending",
            type: "synthesis",
          },
        ],
        "Expanding Domains"
      );

      // Step 3: Domain expansion using resolved entities
      console.log("🔄 Step 3: Expanding within domains...");
      await AgentUpdates.sendMessage(
        userId!,
        "Now I'm exploring what people with similar tastes enjoy in each domain...",
        "Using your resolved entities to find related interests and patterns",
        "domain_expansion"
      );
      
      const domainExpansions = await this.expandDomains(
        resolvedEntities.resolved,
        normalizedTasteInput.demographics
      );
      console.log("✅ Step 3 completed:", domainExpansions);

      // Stream domain expansion insights
      for (const [domain, entities] of Object.entries(domainExpansions)) {
        if (entities.length > 0) {
          await AgentUpdates.sendMessage(
            userId!,
            `I found ${entities.length} related ${domain} that people with your taste enjoy!`,
            `Expanded ${domain} domain based on your preferences`,
            "domain_expansion"
          );

          await AgentUpdates.streamInsights(
            userId!,
            entities,
            {
              stage: "domain_expansion",
              reasoning: `People with your taste in ${domain} also enjoy these`,
              domainType: domain,
            },
            1000
          );
        }
      }

      // Update timeline after Step 3
      await AgentUpdates.sendTimelineUpdate(
        userId!,
        [
          {
            id: "1",
            text: "Gathering Your Interests",
            status: "completed",
            type: "question",
          },
          {
            id: "2",
            text: "Resolving Entities",
            status: "completed",
            type: "analysis",
          },
          {
            id: "3",
            text: "Expanding Domains",
            status: "completed",
            type: "analysis",
          },
          {
            id: "4",
            text: "Cross-Domain Analysis",
            status: "in_progress",
            type: "synthesis",
          },
          {
            id: "5",
            text: "Final Synthesis",
            status: "pending",
            type: "synthesis",
          },
        ],
        "Cross-Domain Analysis"
      );

      // Step 4: Identify optimal domain pairings
      console.log("🔄 Step 4: Identifying domain pairings...");
      await AgentUpdates.sendMessage(
        userId!,
        "Now I'm finding interesting connections between different domains of your interests...",
        "Analyzing cross-domain patterns to discover deeper insights",
        "cross_domain_insights"
      );
      
      const domainPairings = await this.identifyDomainPairings(
        resolvedEntities.resolved,
        domainExpansions
      );
      console.log("✅ Step 4 completed:", domainPairings);

      // Step 5: Cross-domain insights based on pairings
      console.log("🔄 Step 5: Generating cross-domain insights...");
      const crossDomainInsights = await this.generateCrossDomainInsights(
        domainPairings,
        normalizedTasteInput.demographics
      );
      console.log("✅ Step 5 completed:", crossDomainInsights);

      // Stream cross-domain insights
      for (const insight of crossDomainInsights) {
        await AgentUpdates.sendMessage(
          userId!,
          `Interesting! I found connections between ${insight.pairing.sourceDomain} and ${insight.pairing.targetDomain}...`,
          insight.pairing.reasoning,
          "cross_domain_insights"
        );

        const targetDomainEntities = insight.result.insights[insight.pairing.targetDomain]?.entities;
        if (targetDomainEntities && targetDomainEntities.length > 0) {
          await AgentUpdates.streamInsights(
            userId!,
            targetDomainEntities,
            {
              stage: "cross_domain_insights",
              reasoning: `Based on your ${insight.pairing.sourceDomain} preferences, you might enjoy these ${insight.pairing.targetDomain}`,
              domainType: insight.pairing.targetDomain,
            },
            1000
          );
        }
      }

      // Update timeline after Step 5
      await AgentUpdates.sendTimelineUpdate(
        userId!,
        [
          {
            id: "1",
            text: "Gathering Your Interests",
            status: "completed",
            type: "question",
          },
          {
            id: "2",
            text: "Resolving Entities",
            status: "completed",
            type: "analysis",
          },
          {
            id: "3",
            text: "Expanding Domains",
            status: "completed",
            type: "analysis",
          },
          {
            id: "4",
            text: "Cross-Domain Analysis",
            status: "completed",
            type: "synthesis",
          },
          {
            id: "5",
            text: "Final Synthesis",
            status: "in_progress",
            type: "synthesis",
          },
        ],
        "Final Synthesis"
      );

      console.log("🔄 Step 6: Final synthesis and analysis...");
      await AgentUpdates.sendMessage(
        userId!,
        "Perfect! Now I'm synthesizing all these insights into your comprehensive taste profile...",
        "Combining all discoveries into a personalized analysis",
        "final_synthesis"
      );
      
      const finalAnalysis = await this.synthesizeProfile(
        resolvedEntities.resolved,
        domainExpansions,
        crossDomainInsights,
        input,
        normalizedTasteInput.demographics
      );

      await AgentUpdates.sendMessage(
        userId!,
        "✨ Your taste profile is complete! I've discovered fascinating patterns about your preferences and can now provide you with truly personalized experiences.",
        "Successfully created comprehensive taste profile with cross-domain insights",
        "final_synthesis"
      );

      // Final timeline update
      await AgentUpdates.sendTimelineUpdate(
        userId!,
        [
          {
            id: "1",
            text: "Gathering Your Interests",
            status: "completed",
            type: "question",
          },
          {
            id: "2",
            text: "Resolving Entities",
            status: "completed",
            type: "analysis",
          },
          {
            id: "3",
            text: "Expanding Domains",
            status: "completed",
            type: "analysis",
          },
          {
            id: "4",
            text: "Cross-Domain Analysis",
            status: "completed",
            type: "synthesis",
          },
          {
            id: "5",
            text: "Final Synthesis",
            status: "completed",
            type: "synthesis",
          },
        ],
        "Complete"
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log("✅ Taste profile generation completed successfully");
      console.log(`⏱️  Total processing time: ${duration}ms`);
      console.log(
        "📝 Generated taste profile length:",
        finalAnalysis.length,
        "characters"
      );
      console.log(
        "🎯 Taste profile preview:",
        finalAnalysis.substring(0, 200) + "..."
      );

      const result: TasteProfileResult = {
        primaryEntities: resolvedEntities.resolved
          .map((e) => e.resolved)
          .filter(Boolean) as QlooEntity[],
        crossDomainInsights,
        domainExpansions,
        finalAnalysis,
      };

      return result;
    } catch (error) {
      console.error("❌ Error in taste profile generation:", error);
      if (input.userId) {
        await AgentUpdates.sendMessage(
          input.userId,
          "I encountered an issue while processing your profile. Let me try again!",
          "Error during processing",
          "error"
        );
      }
      throw error;
    }
  }

  private async parseUserInput(
    input: TasteProfileInput
  ): Promise<NormalizedTasteInput> {
    const { object } = await generateObject({
      model: this.model,
      schema: z.object({
        entities: z.object({
          music: z.array(
            z.object({
              query: z.string(),
              type: z.literal("artist"),
            })
          ),
          movies: z.array(
            z.object({
              query: z.string(),
              type: z.literal("movie"),
            })
          ),
          tv_shows: z.array(
            z.object({
              query: z.string(),
              type: z.literal("tv_show"),
            })
          ),
          books: z.array(
            z.object({
              query: z.string(),
              type: z.literal("book"),
            })
          ),
          podcasts: z.array(
            z.object({
              query: z.string(),
              type: z.literal("podcast"),
            })
          ),
          brands: z.array(
            z.object({
              query: z.string(),
              type: z.literal("brand"),
            })
          ),
          destinations: z.array(
            z.object({
              query: z.string(),
              type: z.literal("destination"),
            })
          ),
          places: z.array(
            z.object({
              query: z.string(),
              type: z.literal("place"),
            })
          ),
          people: z.array(
            z.object({
              query: z.string(),
              type: z.literal("person"),
            })
          ),
          videogames: z.array(
            z.object({
              query: z.string(),
              type: z.literal("videogame"),
            })
          ),
        }),
        demographics: z.object({
          age: z.enum(["35_and_younger", "36_to_55", "55_and_older"]),
          gender: z.enum(["male", "female"]),
          location: z
            .object({
              query: z.string(),
            })
            .optional(),
        }),
      }),
      system: `You are an expert at categorizing user interests and normalizing demographic data. 
      Given user input, extract and categorize all entities by their type, and normalize demographics.
      
      Available entity types:
      - **artist**: Musicians, bands, singers, composers
      - **book**: Books, novels, non-fiction, literature
      - **brand**: Companies, products, services, organizations
      - **destination**: Travel destinations, cities, countries, landmarks
      - **movie**: Films, movies, cinema
      - **person**: Celebrities, public figures, historical figures
      - **place**: Restaurants, venues, hotels, locations
      - **podcast**: Podcasts, audio shows, radio programs
      - **tv_show**: Television shows, series, programs
      - **videogame**: Video games, gaming titles, interactive media
      
      Age normalization:
      - 35 and under → "35_and_younger"
      - 36 to 55 → "36_to_55" 
      - 55 and older → "55_and_older"
      
      Be smart about categorization:
      - "Jurassic Park" is a movie
      - "Game of Thrones" is a tv_show  
      - "Whitney Houston" is an artist
      - "Founders" is a podcast
      - "Harare" could be a destination or place
      - Programming/software terms go to brands if they're companies, otherwise skip
      
      Return only the entities that can be resolved to actual media/content.`,
      prompt: `Categorize these user interests and normalize demographics: ${JSON.stringify(
        input,
        null,
        2
      )}`,
    });

    return object;
  }

  private async resolveEntities(parsedData: NormalizedTasteInput): Promise<{
    success: boolean;
    resolved: ResolvedEntity[];
    total: number;
    successful: number;
  }> {
    const allEntities: EntityResolutionRequest[] = [];

    // Flatten all categorized entities into a single array
    for (const [category, entities] of Object.entries(parsedData.entities)) {
      if (Array.isArray(entities)) {
        allEntities.push(...entities);
      }
    }

    if (allEntities.length === 0) {
      return {
        success: true,
        resolved: [],
        total: 0,
        successful: 0,
      };
    }

    console.log("🔍 Resolving entities:", allEntities);
    const result = await resolveEntities(allEntities);
    return result;
  }

  private async expandDomains(
    resolvedEntities: ResolvedEntity[],
    normalizedDemographics: Demographics
  ): Promise<DomainExpansions> {
    const domainExpansions: DomainExpansions = {};

    // Group resolved entities by type
    const entitiesByType = this.groupEntitiesByType(resolvedEntities);

    // Expand each domain using resolved entities
    for (const [entityType, entities] of Object.entries(entitiesByType)) {
      if (Array.isArray(entities) && entities.length > 0) {
        const entityIds = entities
          .map((e: ResolvedEntity) => e.resolved?.entity_id)
          .filter((id): id is string => id !== undefined);
        const tags = entities
          .flatMap(
            (e: ResolvedEntity) =>
              e.resolved?.tags?.map((t: { tag_id: string }) => t.tag_id) || []
          )
          .filter((tag): tag is string => tag !== undefined);

        if (entityIds.length > 0) {
          console.log(
            `💡 Expanding ${entityType} domain with ${entityIds.length} entities`
          );
          const result = await getInsights({
            entityIds,
            tags: tags.length > 0 ? tags : undefined,
            outputType: entityType,
            age: normalizedDemographics.age,
            gender: normalizedDemographics.gender,
          });

          domainExpansions[entityType] = result;
        }
      }
    }

    return domainExpansions;
  }

  private async identifyDomainPairings(
    resolvedEntities: ResolvedEntity[],
    domainExpansions: DomainExpansions
  ): Promise<DomainPairing[]> {
    const { object } = await generateObject({
      model: this.model,
      schema: z.object({
        pairings: z.array(
          z.object({
            sourceDomain: z.string(),
            targetDomain: z.string(),
            reasoning: z.string(),
            sourceEntities: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
              })
            ),
          })
        ),
      }),
      system: `You are an expert at identifying optimal domain pairings for taste profiling.
      
      Based on the resolved entities and domain expansions, identify which domain combinations would yield the best cross-domain insights.
      
      Consider these proven domain pairings:
      - Podcast tastes → Book recommendations (high correlation)
      - TV show preferences → Movie recommendations (similar storytelling)
      - Book preferences → Movie/TV adaptations (source material)
      - Music tastes → Brand preferences (lifestyle alignment)
      - Movie preferences → TV show recommendations (genre alignment)
      
      Only suggest pairings where you have source entities available.
      
      For sourceEntities, use the entity_id from the resolved entities as the 'id' field and the original query as the 'name' field.`,
      prompt: `Identify optimal domain pairings for cross-domain insights:
      
      Resolved Entities: ${JSON.stringify(resolvedEntities, null, 2)}
      Domain Expansions: ${JSON.stringify(domainExpansions, null, 2)}`,
    });

    return object.pairings;
  }

  private async generateCrossDomainInsights(
    domainPairings: DomainPairing[],
    normalizedDemographics: Demographics
  ): Promise<CrossDomainInsight[]> {
    const crossDomainResults: CrossDomainInsight[] = [];

    for (const pairing of domainPairings) {
      console.log(
        `🌐 Cross-domain search: ${pairing.sourceDomain} → ${pairing.targetDomain}`
      );
      const result = await crossDomainProfileByIds({
        entityIds: pairing.sourceEntities.map(
          (entity: { id: string; name: string }) => entity.id
        ),
        domains: [pairing.targetDomain],
        demographics: {
          age: normalizedDemographics.age,
          gender: normalizedDemographics.gender,
        },
        location: normalizedDemographics.location,
      });

      crossDomainResults.push({
        pairing,
        result,
      });
    }

    return crossDomainResults;
  }

  private async synthesizeProfile(
    resolvedEntities: any,
    domainExpansions: DomainExpansions,
    crossDomainInsights: CrossDomainInsight[],
    input: TasteProfileInput,
    normalizedDemographics: Demographics
  ) {
    const { text } = await generateText({
      model: this.model,
      system: TASTE_PROFILING_AGENT_PROMPT,
      prompt: `Create a comprehensive taste profile based on all the collected data:
      
      User Input: ${JSON.stringify(input, null, 2)}
      Normalized Demographics: ${JSON.stringify(
        normalizedDemographics,
        null,
        2
      )}
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

  private groupEntitiesByType(resolvedEntities: ResolvedEntity[]) {
    const grouped: Record<string, ResolvedEntity[]> = {};

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

export const tasteProfilingAgent = new TasteProfilerAgent();
