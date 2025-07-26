import { Qloo } from "@devma/qloo";
import { config } from "../../server.config";
import type {
  FilterType,
  GetInsightsRequest,
  GetInsightsResponse,
  SignalDemographicsAge,
  SignalDemographicsGender,
} from "@devma/qloo/dist/commonjs/models/operations/getinsights";
import {
  GetAudiencesRequest,
  GetAudiencesResponse,
  GetTagsRequest,
  GetTagsResponse,
  GetTagTypesRequest,
  GetTagTypesResponse,
} from "@devma/qloo/dist/commonjs/models/operations";

const qloo = new Qloo({
  apiKey: config.qloo.apiKey,
});

// export interface TasteProfile {
//   interests: {
//     entities: string[];
//     tags: string[];
//   };
//   demographics: {
//     age?:
//       | "under_21"
//       | "21_to_34"
//       | "35_to_54"
//       | "55_and_older"
//       | "35_and_younger"
//       | "36_to_55";
//     gender?: "male" | "female";
//     audiences?: string[];
//   };
//   location?: {
//     query?: string;
//     coordinates?: string;
//     radius?: number;
//   };
// }

export type InsightOptions = {
  take?: number;
  page?: number;
  explainability?: boolean;
  diversify?: {
    by: string;
    take: number;
  };
};

export function getEntityTypeFromString(entityType: string) {
  const typeMap: Record<string, string> = {
    restaurant: "urn:entity:place",
    place: "urn:entity:place",
    hotel: "urn:entity:place",
    venue: "urn:entity:place",
    movie: "urn:entity:movie",
    film: "urn:entity:movie",
    artist: "urn:entity:artist",
    musician: "urn:entity:artist",
    band: "urn:entity:artist",
    podcast: "urn:entity:podcast",
    show: "urn:entity:podcast",
    brand: "urn:entity:brand",
    company: "urn:entity:brand",
    book: "urn:entity:book",
    person: "urn:entity:person",
    celebrity: "urn:entity:person",
  };

  return typeMap[entityType.toLowerCase()] as FilterType;
}

export class QlooProvider {
  static async getInsights(
    request: GetInsightsRequest
  ): Promise<GetInsightsResponse> {
    try {
      return await qloo.insights.getInsights(request);
    } catch (error) {
      console.error("Qloo place insights error:", error);
      throw new Error(
        `Failed to get place insights: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getTags(request: GetTagsRequest): Promise<GetTagsResponse> {
    try {
      return await qloo.tags.getTags(request);
    } catch (error) {
      console.error("Qloo tag search error:", error);
      throw new Error(
        `Failed to search tags: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getTagTypes(
    request: GetTagTypesRequest
  ): Promise<GetTagTypesResponse> {
    try {
      return await qloo.tags.getTagTypes(request);
    } catch (error) {
      console.error("Qloo tag types error:", error);
      throw new Error(
        `Failed to get tag types: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getAudiences(
    request: GetAudiencesRequest
  ): Promise<GetAudiencesResponse> {
    try {
      return await qloo.audiences.getAudiences(request);
    } catch (error) {
      console.error("Qloo audiences error:", error);
      throw new Error(
        `Failed to get audiences: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getAudienceTypes() {
    try {
      return await qloo.audiences.getAudienceTypes({
        take: 50,
      });
    } catch (error) {
      console.error("Qloo audience types error:", error);
      throw new Error(
        `Failed to get audience types: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async searchEntities(
    query: string,
    options?: {
      entityType?: string;
      take?: number;
    }
  ) {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append("query", query);

      if (options?.entityType) {
        searchParams.append(
          "filter.type",
          getEntityTypeFromString(options.entityType)
        );
      }
      if (options?.take) {
        searchParams.append("take", options.take.toString());
      }

      // Use direct HTTP call for search endpoint
      const response = await fetch(
        `https://hackathon.api.qloo.com/search?${searchParams}`,
        {
          headers: {
            "x-api-key": config.qloo.apiKey!,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Search failed: ${response.status} ${response.statusText}`
        );
      }

      const rawResult = await response.json();

      const cleanedResults =
        rawResult.results?.map((entity: any) => ({
          name: entity.name,
          entity_id: entity.entity_id,
          type: entity.types?.[0] || "urn:entity",
          popularity: entity.popularity,
          description: entity.properties?.short_description || "",
          image: entity.properties?.image?.url || null,
        })) || [];

      return {
        success: true,
        results: cleanedResults,
        total: cleanedResults.length,
        query: query,
      };
    } catch (error) {
      console.error("Qloo entity search error:", error);
      throw new Error(
        `Failed to search entities: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getEntitiesByIds(
    entityIds: string[],
    options?: {
      includeProperties?: boolean;
      includeTags?: boolean;
    }
  ) {
    try {
      if (!config.qloo.apiKey) {
        throw new Error("Qloo API key is not configured");
      }

      const searchParams = new URLSearchParams();
      searchParams.append("ids", entityIds.join(","));

      if (options?.includeProperties) {
        searchParams.append("include_properties", "true");
      }
      if (options?.includeTags) {
        searchParams.append("include_tags", "true");
      }

      const response = await fetch(
        `${config.qloo.url}/entities?${searchParams}`,
        {
          headers: {
            "x-api-key": config.qloo.apiKey!,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Entity lookup failed: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Qloo entity lookup error:", error);
      throw new Error(
        `Failed to lookup entities: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async analyzeEntities(params: {
    filterType: string;
    entityIds: string[];
    analysisType?: "tags" | "entities" | "both";
    filters?: {
      tagTypes?: string[];
      entityTypes?: string[];
      parentTypes?: string[];
    };
    options?: {
      take?: number;
      confidence?: number;
    };
  }) {
    const {
      filterType,
      entityIds,
      analysisType = "both",
      filters = {},
      options = {},
    } = params;

    try {
      const request: any = {
        "signal.interests.entities": entityIds.join(","),
        take: options.take || 20,
      };

      // Analyze for tags
      if (analysisType === "tags" || analysisType === "both") {
        const tagRequest = {
          ...request,
          "filter.type": "urn:tag",
        };

        if (filters.tagTypes?.length) {
          tagRequest["filter.tag.types"] = filters.tagTypes.join(",");
        }
        if (filters.parentTypes?.length) {
          tagRequest["filter.parents.types"] = filters.parentTypes.join(",");
        }

        const tagResponse = await qloo.insights.getInsights(tagRequest);

        // If we only want tags, return here
        if (analysisType === "tags") {
          return { tags: tagResponse, entities: null };
        }

        // For 'both', continue to get entities
        const entityRequest = {
          ...request,
          "filter.type": filters.entityTypes?.length
            ? filters.entityTypes.join(",")
            : "urn:entity",
        };

        const entityResponse = await qloo.insights.getInsights(entityRequest);

        return {
          tags: tagResponse,
          entities: entityResponse,
        };
      }

      // Analyze for similar entities only
      else {
        request["filter.type"] = filters.entityTypes?.length
          ? filters.entityTypes.join(",")
          : "urn:entity";
        const response = await qloo.insights.getInsights(request);
        return { tags: null, entities: response };
      }
    } catch (error) {
      console.error("Qloo analysis error:", error);
      throw new Error(
        `Failed to analyze entities: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }


}

export const qlooProvider = QlooProvider;
