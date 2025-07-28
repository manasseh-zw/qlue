import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { TASTE_PROFILING_AGENT_PROMPT } from "./prompts";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import {
  resolveEntities,
  getInsights,
  crossDomainProfileByIds,
  ResolvedEntity,
  EntityResolutionRequest,
  CrossDomainProfileResult,
} from "../services/taste.service";
import { azure, createAzure } from "@ai-sdk/azure";

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
  [domain: string]: any;
};

export type CrossDomainInsight = {
  pairing: DomainPairing;
  result: CrossDomainProfileResult;
};

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
  azure = createAzure();
  private model = azure.languageModel("gpt-4.1");
  // model = openai("gpt-4.1");

  async generateTasteProfile(input: TasteProfileInput): Promise<string> {
    console.log(
      "🤖 TasteProfilingAgent: Starting structured taste profile generation"
    );
    console.log("📊 Input data:", JSON.stringify(input, null, 2));

    try {
      const startTime = Date.now();

      // Step 1: Parse and categorize user input into entity resolution requests
      console.log("🔄 Step 1: Parsing and categorizing user input...");
      const normalizedTasteInput = await this.parseUserInput(input);
      console.log("✅ Step 1 completed:", normalizedTasteInput);

      // Step 2: Resolve all entities to get IDs and metadata
      console.log("🔄 Step 2: Resolving entities...");
      const resolvedEntities = await this.resolveEntities(normalizedTasteInput);
      console.log("✅ Step 2 completed:", resolvedEntities);

      // Step 3: Domain expansion using resolved entities
      console.log("🔄 Step 3: Expanding within domains...");
      const domainExpansions = await this.expandDomains(
        resolvedEntities.resolved,
        normalizedTasteInput.demographics
      );
      console.log("✅ Step 3 completed:", domainExpansions);

      // Step 4: Identify optimal domain pairings
      console.log("🔄 Step 4: Identifying domain pairings...");
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

      // Step 6: Final synthesis and analysis
      console.log("🔄 Step 6: Final synthesis and analysis...");
      const finalProfile = await this.synthesizeProfile(
        resolvedEntities.resolved,
        domainExpansions,
        crossDomainInsights,
        input,
        normalizedTasteInput.demographics
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log("✅ Taste profile generation completed successfully");
      console.log(`⏱️  Total processing time: ${duration}ms`);
      console.log(
        "📝 Generated taste profile length:",
        finalProfile.length,
        "characters"
      );
      console.log(
        "🎯 Taste profile preview:",
        finalProfile.substring(0, 200) + "..."
      );

      return finalProfile;
    } catch (error) {
      console.error("❌ Error in taste profile generation:", error);
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

  private async resolveEntities(parsedData: NormalizedTasteInput) {
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

export const tasteProfilingAgent = new TasteProfilingAgent();
