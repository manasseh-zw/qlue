import { tool } from "ai";
import { z } from "zod";
import {
  resolveEntities,
  getInsights,
  crossDomainProfile,
} from "../../services/taste.service";

export const resolveEntitiesTool = tool({
  description:
    "Resolve entity queries to their corresponding entity IDs and metadata. This is the first step in taste profiling - converting user input into structured entity data.",
  parameters: z.object({
    entities: z.array(
      z.object({
        query: z.string().describe(
          "The entity name to search for (e.g., 'Whitney Houston', 'Jurassic Park')"
        ),
        type: z.string().describe(
          "The entity type to search for (e.g., 'artist', 'movie', 'podcast', 'book', 'brand')"
        ),
      })
    ).describe("Array of entity resolution requests with query and type"),
  }),
  execute: async ({ entities }) => {
    console.log("🔍 resolveEntities tool called with:", JSON.stringify({ entities }, null, 2));
    const startTime = Date.now();
    
    try {
      const result = await resolveEntities(entities);
      const endTime = Date.now();
      
      console.log(`✅ resolveEntities completed in ${endTime - startTime}ms`);
      console.log(`📊 Resolved ${result.successful} out of ${result.total} entities`);
      
      return {
        success: result.success,
        resolved: result.resolved,
        total: result.total,
        successful: result.successful,
        summary: `Successfully resolved ${result.successful} out of ${result.total} entities`,
      };
    } catch (error) {
      const endTime = Date.now();
      console.error(`❌ resolveEntities failed after ${endTime - startTime}ms:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        resolved: [],
        total: entities.length,
        successful: 0,
      };
    }
  },
});

export const getInsightsTool = tool({
  description:
    "Get domain-specific insights and recommendations based on entity IDs. This is the second step in taste profiling - expanding interests within specific domains.",
  parameters: z.object({
    entityIds: z.array(z.string()).describe("Array of entity IDs to use as signals for insights"),
    tags: z.array(z.string()).optional().describe("Optional array of tag IDs to include as additional signals"),
    outputType: z.string().describe("The type of entities to get insights for"),
    age: z.string().optional().describe("Optional age demographic filter"),
    gender: z.string().optional().describe("Optional gender demographic filter ('male' or 'female')"),
    take: z.number().optional().describe("Number of insights to return (default: 10)"),
  }),
  execute: async ({ entityIds, tags, outputType, age, gender, take }) => {
    console.log("💡 getInsights tool called with:", JSON.stringify({ entityIds, tags, outputType, age, gender, take }, null, 2));
    const startTime = Date.now();
    
    try {
      const result = await getInsights({
        entityIds,
        tags,
        outputType,
        age,
        gender,
        take: take || 10,
      });
      const endTime = Date.now();
      
      console.log(`✅ getInsights completed in ${endTime - startTime}ms`);
      console.log(`📈 Retrieved ${Array.isArray(result) ? result.length : 0} insights for ${outputType} entities`);
      
      return {
        success: true,
        insights: result,
        summary: `Retrieved ${
          Array.isArray(result) ? result.length : 0
        } insights for ${outputType} entities`,
      };
    } catch (error) {
      const endTime = Date.now();
      console.error(`❌ getInsights failed after ${endTime - startTime}ms:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        insights: [],
        summary: "Failed to retrieve insights",
      };
    }
  },
});

export const crossDomainProfileTool = tool({
  description:
    "Perform comprehensive cross-domain taste analysis. This is the third step in taste profiling - combining entities from different domains to discover niche insights and patterns.",
  parameters: z.object({
    entities: z.array(
      z.object({
        query: z.string(),
        type: z.string(),
      })
    ).describe("Array of entity resolution requests"),
    domains: z.array(z.string()).describe(
      "Array of domains to analyze (e.g., ['movie', 'artist', 'podcast', 'book', 'brand'])"
    ),
    demographics: z.object({
      age: z.string().optional(),
      gender: z.string().optional(),
    }).optional().describe("Optional demographic filters"),
    location: z.object({
      query: z.string().optional(),
    }).optional().describe("Optional location filter (e.g., 'San Francisco, CA')"),
  }),
  execute: async ({ entities, domains, demographics, location }) => {
    console.log("🌐 crossDomainProfile tool called with:", JSON.stringify({ entities, domains, demographics, location }, null, 2));
    const startTime = Date.now();
    
    try {
      const result = await crossDomainProfile({
        entities,
        domains,
        demographics,
        location,
        options: { take: 10 },
      });
      const endTime = Date.now();
      
      console.log(`✅ crossDomainProfile completed in ${endTime - startTime}ms`);
      console.log(`🎯 Generated profile with ${result.summary.totalInsights} insights across ${result.summary.domainsAnalyzed} domains`);
      
      return {
        success: true,
        profile: result,
        summary: `Generated cross-domain profile with ${result.summary.totalInsights} insights across ${result.summary.domainsAnalyzed} domains`,
      };
    } catch (error) {
      const endTime = Date.now();
      console.error(`❌ crossDomainProfile failed after ${endTime - startTime}ms:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        profile: null,
        summary: "Failed to generate cross-domain profile",
      };
    }
  },
});

export const tasteTools = {
  resolveEntities: resolveEntitiesTool,
  getInsights: getInsightsTool,
  crossDomainProfile: crossDomainProfileTool,
};

export type TasteTool = keyof typeof tasteTools;
