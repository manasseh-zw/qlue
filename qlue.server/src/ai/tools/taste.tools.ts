import {
  resolveEntities,
  getInsights,
  crossDomainProfile,
  type EntityResolutionRequest,
  type InsightRequest,
  type CrossDomainProfileRequest,
} from "../../services/taste.service";

export const tasteTools = {
  resolveEntities: {
    name: "resolveEntities",
    description: "Resolve entity queries to their corresponding entity IDs and metadata. This is the first step in taste profiling - converting user input into structured entity data.",
    parameters: {
      type: "object",
      properties: {
        entities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The entity name to search for (e.g., 'Whitney Houston', 'Jurassic Park')"
              },
              type: {
                type: "string",
                description: "The entity type to search for (e.g., 'artist', 'movie', 'podcast', 'book', 'brand')"
              }
            },
            required: ["query", "type"]
          },
          description: "Array of entity resolution requests with query and type"
        }
      },
      required: ["entities"]
    },
    execute: async (params: { entities: EntityResolutionRequest[] }) => {
      try {
        const result = await resolveEntities(params.entities);
        return {
          success: result.success,
          resolved: result.resolved,
          total: result.total,
          successful: result.successful,
          summary: `Successfully resolved ${result.successful} out of ${result.total} entities`
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          resolved: [],
          total: params.entities.length,
          successful: 0
        };
      }
    }
  },

  getInsights: {
    name: "getInsights",
    description: "Get domain-specific insights and recommendations based on entity IDs. This is the second step in taste profiling - expanding interests within specific domains.",
    parameters: {
      type: "object",
      properties: {
        entityIds: {
          type: "array",
          items: { type: "string" },
          description: "Array of entity IDs to use as signals for insights"
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Optional array of tag IDs to include as additional signals"
        },
        outputType: {
          type: "string",
          description: "The type of entities to get insights for"
        },
        age: {
          type: "string",
          description: "Optional age demographic filter"
        },
        gender: {
          type: "string",
          description: "Optional gender demographic filter ('male' or 'female')"
        },
        take: {
          type: "number",
          description: "Number of insights to return (default: 10)"
        }
      },
      required: ["entityIds", "outputType"]
    },
    execute: async (params: InsightRequest) => {
      try {
        const result = await getInsights({
          ...params,
          take: params.take || 10
        });
        return {
          success: true,
          insights: result,
          summary: `Retrieved ${Array.isArray(result) ? result.length : 0} insights for ${params.outputType} entities`
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          insights: [],
          summary: "Failed to retrieve insights"
        };
      }
    }
  },

  crossDomainProfile: {
    name: "crossDomainProfile",
    description: "Perform comprehensive cross-domain taste analysis. This is the third step in taste profiling - combining entities from different domains to discover niche insights and patterns.",
    parameters: {
      type: "object",
      properties: {
        entities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              query: { type: "string" },
              type: { type: "string" }
            },
            required: ["query", "type"]
          },
          description: "Array of entity resolution requests"
        },
        domains: {
          type: "array",
          items: { type: "string" },
          description: "Array of domains to analyze (e.g., ['movie', 'artist', 'podcast', 'book', 'brand'])"
        },
        demographics: {
          type: "object",
          properties: {
            age: { type: "string" },
            gender: { type: "string" }
          },
          description: "Optional demographic filters"
        },
        location: {
          type: "object",
          properties: {
            query: { type: "string" }
          },
          description: "Optional location filter (e.g., 'San Francisco, CA')"
        }
      },
      required: ["entities", "domains"]
    },
    execute: async (params: CrossDomainProfileRequest) => {
      try {
        const result = await crossDomainProfile({
          ...params,
          options: { take: 10 }
        });
        return {
          success: true,
          profile: result,
          summary: `Generated cross-domain profile with ${result.summary.totalInsights} insights across ${result.summary.domainsAnalyzed} domains`
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          profile: null,
          summary: "Failed to generate cross-domain profile"
        };
      }
    }
  }
};

export type TasteTool = keyof typeof tasteTools; 