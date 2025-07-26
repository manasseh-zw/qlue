import { Qloo } from "@devma/qloo";
import { config } from "../../server.config";
import type{GetInsightsRequest} from "@devma/qloo/dist/commonjs/models/operations/getinsights";
const qloo = new Qloo({
  apiKey: config.qloo.apiKey,
});

export interface TasteProfile {
  interests: {
    entities: string[];
    tags: string[];
  };
  demographics: {
    age?:
      | "under_21"
      | "21_to_34"
      | "35_to_54"
      | "55_and_older"
      | "35_and_younger"
      | "36_to_55";
    gender?: "male" | "female";
    audiences?: string[];
  };
  location?: {
    query?: string;
    coordinates?: string;
    radius?: number;
  };
}

export interface InsightOptions {
  take?: number;
  page?: number;
  explainability?: boolean;
  diversify?: {
    by: string;
    take: number;
  };
}

export class QlooProvider {
  
  static async getPlaceInsights(params: {
    signals?: {
      entities?: string[];
      tags?: string[];
      location?: string;
      demographics?: TasteProfile["demographics"];
    };
    filters?: {
      location?: string;
      locationRadius?: number;
      priceMin?: number;
      priceMax?: number;
      ratingMin?: number;
      hours?: string;
      excludeLocation?: string;
    };
    options?: InsightOptions;
  }) {
    const { signals = {}, filters = {}, options = {} } = params;
    try {
      const request: any = {
        filterType: "urn:entity:place",
        take: options.take || 10,
        page: options.page || 1,
      };

      // Add primary signals (required)
      if (signals.entities?.length) {
        request.signalInterestsEntities = signals.entities;
      }
      if (signals.tags?.length) {
        request.signalInterestsTags = signals.tags;
      }
      if (signals.location) {
        request.signalLocationQuery = signals.location;
      }

      // Add demographic signals
      if (signals.demographics?.age) {
        request.signalDemographicsAge = signals.demographics.age;
      }
      if (signals.demographics?.gender) {
        request.signalDemographicsGender = signals.demographics.gender;
      }
      if (signals.demographics?.audiences?.length) {
        request.signalDemographicsAudiences = signals.demographics.audiences;
      }

      // Add filters
      if (filters.location) {
        request.filterLocationQuery = filters.location;
      }
      if (filters.locationRadius) {
        request.filterLocationRadius = filters.locationRadius;
      }
      if (filters.priceMin) {
        request.filterPriceLevelMin = filters.priceMin;
      }
      if (filters.priceMax) {
        request.filterPriceLevelMax = filters.priceMax;
      }
      if (filters.ratingMin) {
        request.filterRatingMin = filters.ratingMin;
      }
      if (filters.hours) {
        request.filterHours = filters.hours;
      }
      if (filters.excludeLocation) {
        request.filterExcludeLocationQuery = filters.excludeLocation;
      }

      // Add options
      if (options.explainability) {
        request.featureExplainability = true;
      }
      if (options.diversify) {
        request.diversifyBy = options.diversify.by;
        request.diversifyTake = options.diversify.take;
      }

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

  static async getMovieInsights(params: {
    signals?: {
      entities?: string[];
      tags?: string[];
      demographics?: TasteProfile["demographics"];
    };
    filters?: {
      releaseYearMin?: number;
      releaseYearMax?: number;
      contentRating?: string;
      genre?: string[];
    };
    options?: InsightOptions;
  }) {
    const { signals = {}, filters = {}, options = {} } = params;

    try {
      const request: any = {
        filterType: "urn:entity:movie",
        take: options.take || 10,
        page: options.page || 1,
      };

      // Primary signals
      if (signals.entities?.length) {
        request.signalInterestsEntities = signals.entities;
      }
      if (signals.tags?.length) {
        request.signalInterestsTags = signals.tags;
      }

      // Demographics
      if (signals.demographics?.age) {
        request.signalDemographicsAge = signals.demographics.age;
      }
      if (signals.demographics?.gender) {
        request.signalDemographicsGender = signals.demographics.gender;
      }

      // Filters
      if (filters.releaseYearMin) {
        request.filterReleaseYearMin = filters.releaseYearMin;
      }
      if (filters.releaseYearMax) {
        request.filterReleaseYearMax = filters.releaseYearMax;
      }
      if (filters.contentRating) {
        request.filterContentRating = filters.contentRating;
      }

      if (options.explainability) {
        request.featureExplainability = true;
      }

      return await qloo.insights.getInsights(request);
    } catch (error) {
      console.error("Qloo movie insights error:", error);
      throw new Error(
        `Failed to get movie insights: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getArtistInsights(params: {
    signals?: {
      entities?: string[];
      tags?: string[];
      demographics?: TasteProfile["demographics"];
    };
    options?: InsightOptions;
  }) {
    const { signals = {}, options = {} } = params;

    try {
      const request: any = {
        filterType: "urn:entity:artist",
        take: options.take || 10,
        page: options.page || 1,
      };

      if (signals.entities?.length) {
        request.signalInterestsEntities = signals.entities;
      }
      if (signals.tags?.length) {
        request.signalInterestsTags = signals.tags;
      }
      if (signals.demographics?.age) {
        request.signalDemographicsAge = signals.demographics.age;
      }
      if (signals.demographics?.gender) {
        request.signalDemographicsGender = signals.demographics.gender;
      }

      if (options.explainability) {
        request.featureExplainability = true;
      }

      return await qloo.insights.getInsights(request);
    } catch (error) {
      console.error("Qloo artist insights error:", error);
      throw new Error(
        `Failed to get artist insights: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getPodcastInsights(params: {
    signals?: {
      entities?: string[];
      tags?: string[];
      demographics?: TasteProfile["demographics"];
    };
    options?: InsightOptions;
  }) {
    const { signals = {}, options = {} } = params;

    try {
      const request: any = {
        filterType: "urn:entity:podcast",
        take: options.take || 10,
        page: options.page || 1,
      };

      if (signals.entities?.length) {
        request.signalInterestsEntities = signals.entities;
      }
      if (signals.tags?.length) {
        request.signalInterestsTags = signals.tags;
      }
      if (signals.demographics?.age) {
        request.signalDemographicsAge = signals.demographics.age;
      }
      if (signals.demographics?.gender) {
        request.signalDemographicsGender = signals.demographics.gender;
      }

      if (options.explainability) {
        request.featureExplainability = true;
      }

      return await qloo.insights.getInsights(request);
    } catch (error) {
      console.error("Qloo podcast insights error:", error);
      throw new Error(
        `Failed to get podcast insights: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getBrandInsights(params: {
    signals?: {
      entities?: string[];
      tags?: string[];
      demographics?: TasteProfile["demographics"];
    };
    options?: InsightOptions;
  }) {
    const { signals = {}, options = {} } = params;

    try {
      const request: any = {
        filterType: "urn:entity:brand",
        take: options.take || 10,
        page: options.page || 1,
      };

      if (signals.entities?.length) {
        request.signalInterestsEntities = signals.entities;
      }
      if (signals.tags?.length) {
        request.signalInterestsTags = signals.tags;
      }
      if (signals.demographics?.age) {
        request.signalDemographicsAge = signals.demographics.age;
      }
      if (signals.demographics?.gender) {
        request.signalDemographicsGender = signals.demographics.gender;
      }

      if (options.explainability) {
        request.featureExplainability = true;
      }

      return await qloo.insights.getInsights(request);
    } catch (error) {
      console.error("Qloo brand insights error:", error);
      throw new Error(
        `Failed to get brand insights: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getBookInsights(params: {
    signals?: {
      entities?: string[];
      tags?: string[];
      demographics?: TasteProfile["demographics"];
    };
    filters?: {
      publicationYearMin?: number;
      publicationYearMax?: number;
    };
    options?: InsightOptions;
  }) {
    const { signals = {}, filters = {}, options = {} } = params;

    try {
      const request: any = {
        filterType: "urn:entity:book",
        take: options.take || 10,
        page: options.page || 1,
      };

      if (signals.entities?.length) {
        request.signalInterestsEntities = signals.entities;
      }
      if (signals.tags?.length) {
        request.signalInterestsTags = signals.tags;
      }
      if (signals.demographics?.age) {
        request.signalDemographicsAge = signals.demographics.age;
      }
      if (signals.demographics?.gender) {
        request.signalDemographicsGender = signals.demographics.gender;
      }

      if (filters.publicationYearMin) {
        request.filterPublicationYearMin = filters.publicationYearMin;
      }
      if (filters.publicationYearMax) {
        request.filterPublicationYearMax = filters.publicationYearMax;
      }

      if (options.explainability) {
        request.featureExplainability = true;
      }

      return await qloo.insights.getInsights(request);
    } catch (error) {
      console.error("Qloo book insights error:", error);
      throw new Error(
        `Failed to get book insights: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async searchTags(
    query: string,
    options?: {
      tagTypes?: string[];
      take?: number;
      typoTolerance?: boolean;
    }
  ) {
    try {
      const request: any = {
        filterQuery: query,
        take: options?.take || 20,
        featureTypoTolerance: options?.typoTolerance ?? true,
      };

      if (options?.tagTypes?.length) {
        request.filterTagTypes = options.tagTypes;
      }

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

  static async getTagTypes(parentTypes?: string[]) {
    try {
      const request: any = {
        take: 50,
      };

      if (parentTypes?.length) {
        request.filterParentsTypes = parentTypes;
      }

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

  static async getRestaurantTags(query?: string) {
    return this.searchTags(query || "", {
      tagTypes: ["urn:tag:genre:restaurant"],
      take: 30,
    });
  }


  static async getMusicTags(query?: string) {
    return this.searchTags(query || "", {
      tagTypes: ["urn:tag:genre:music"],
      take: 30,
    });
  }

  static async getPodcastTags(query?: string) {
    return this.searchTags(query || "", {
      tagTypes: ["urn:tag:genre:podcast"],
      take: 30,
    });
  }

  static async getMovieTags(query?: string) {
    return this.searchTags(query || "", {
      tagTypes: ["urn:tag:genre:media"],
      take: 30,
    });
  }
  
  static async getAudiences(options?: {
    parentTypes?: string[];
    take?: number;
  }) {
    try {
      const request: any = {
        take: options?.take || 50,
      };

      if (options?.parentTypes?.length) {
        request.filterParentsTypes = options.parentTypes;
      }

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

  static async getCommunityAudiences() {
    return this.getAudiences({
      parentTypes: ["urn:audience:communities"],
      take: 30,
    });
  }

  static async buildCrossDomainProfile(params: {
    baseEntities: string[];
    demographics?: TasteProfile["demographics"];
    location?: string;
    take?: number;
  }) {
    const { baseEntities, demographics, location, take = 5 } = params;

    try {
      const signals = {
        entities: baseEntities,
        demographics,
        location,
      };

      const [places, artists, movies, podcasts, brands] =
        await Promise.allSettled([
          this.getPlaceInsights({
            signals: { ...signals, location },
            filters: location ? { location } : {},
            options: { take },
          }),
          this.getArtistInsights({ signals, options: { take } }),
          this.getMovieInsights({ signals, options: { take } }),
          this.getPodcastInsights({ signals, options: { take } }),
          this.getBrandInsights({ signals, options: { take } }),
        ]);

      return {
        places: places.status === "fulfilled" ? places.value : null,
        artists: artists.status === "fulfilled" ? artists.value : null,
        movies: movies.status === "fulfilled" ? movies.value : null,
        podcasts: podcasts.status === "fulfilled" ? podcasts.value : null,
        brands: brands.status === "fulfilled" ? brands.value : null,
        errors: [places, artists, movies, podcasts, brands]
          .filter((result) => result.status === "rejected")
          .map((result) => (result as PromiseRejectedResult).reason),
      };
    } catch (error) {
      console.error("Cross-domain profile error:", error);
      throw new Error(
        `Failed to build cross-domain profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static getEntityTypeFromString(entityType: string) {
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

    return typeMap[entityType.toLowerCase()] || entityType;
  }

  static validateSignals(signals: {
    entities?: string[];
    tags?: string[];
    location?: string;
  }): boolean {
    return !!(
      (signals.entities && signals.entities.length > 0) ||
      (signals.tags && signals.tags.length > 0) ||
      signals.location
    );
  }

  /**
   * Search for entities by query string
   * Essential for converting user input into valid Qloo entity IDs
   */
  static async searchEntities(query: string, options?: {
    entityType?: string;
    take?: number;
  }) {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append("query", query);
      
      if (options?.entityType) {
        searchParams.append("filter.type", this.getEntityTypeFromString(options.entityType));
      }
      if (options?.take) {
        searchParams.append("take", options.take.toString());
      }

      // Use direct HTTP call for search endpoint
      const response = await fetch(`https://hackathon.api.qloo.com/search?${searchParams}`,  {
        headers: {
          "x-api-key": config.qloo.apiKey!,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const rawResult = await response.json();
      
      // Clean and minimize the response for LLM consumption
      const cleanedResults = rawResult.results?.map((entity: any) => ({
        name: entity.name,
        entity_id: entity.entity_id,
        type: entity.types?.[0] || 'urn:entity',
        popularity: entity.popularity,
        description: entity.properties?.short_description || '',
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

  /**
   * Quick entity resolution for user input
   * Converts names to Qloo entity IDs for use in other methods
   */
  static async resolveEntities(entities: Array<string>) {
    try {
      const resolvedEntities = [];

      for (const entity of entities) {
        try {
          const result = await this.searchEntities(entity, {
            take: 5, // Get top 5 matches for each entity
          });

          // Extract the first (best) match
          if (result.results?.length > 0) {
            resolvedEntities.push({
              input: entity,
              resolved: result.results[0],
              alternatives: result.results.slice(1, 3), // Keep 2 alternatives
            });
          } else {
            resolvedEntities.push({
              input: entity,
              resolved: null,
              alternatives: [],
            });
          }
        } catch (error) {
          console.warn(`Failed to resolve entity "${entity}":`, error);
          resolvedEntities.push({
            input: entity,
            resolved: null,
            alternatives: [],
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return {
        success: true,
        resolved: resolvedEntities,
        total: entities.length,
        successful: resolvedEntities.filter(r => r.resolved !== null).length,
      };
    } catch (error) {
      console.error("Entity resolution error:", error);
      throw new Error(
        `Failed to resolve entities: ${
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


  static async compareEntityGroups(params: {
    group1: {
      entityIds: string[];
      label?: string;
    };
    group2: {
      entityIds: string[];
      label?: string;
    };
    compareType?: "tags" | "entities" | "both";
    filters?: {
      entityTypes?: string[];
      tagTypes?: string[];
    };
    options?: {
      take?: number;
      showDifferences?: boolean;
    };
  }) {
    const {
      group1,
      group2,
      compareType = "both",
      filters = {},
      options = {},
    } = params;

    try {
      // Use the v2 insights compare endpoint
      const request: any = {
        "signal.interests.entities.a": group1.entityIds.join(","),
        "signal.interests.entities.b": group2.entityIds.join(","),
        take: options.take || 15,
      };

      if (filters.entityTypes?.length) {
        request["filter.type"] = filters.entityTypes.join(",");
      }
      if (filters.tagTypes?.length) {
        request["filter.tag.types"] = filters.tagTypes.join(",");
      }

      if (!config.qloo.apiKey) {
        throw new Error("Qloo API key is not configured");
      }

      const response = await fetch("${config.qloo.url}/v2/insights/compare", {
        method: "GET",
        headers: {
          "x-api-key": config.qloo.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Comparison failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      return {
        success: result.success,
        group1Label: group1.label || "Group A",
        group2Label: group2.label || "Group B",
        comparison: result.results,
        insights: result.query || {},
      };
    } catch (error) {
      console.error("Qloo comparison error:", error);
      throw new Error(
        `Failed to compare entity groups: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }


  static async analyzeTasteSimilarity(params: {
    targetEntities: string[];
    candidateEntities: string[];
    analysisDepth?: "shallow" | "deep";
    includeExplanation?: boolean;
  }) {
    const {
      targetEntities,
      candidateEntities,
      analysisDepth = "shallow",
      includeExplanation = false,
    } = params;

    try {
      const similarities: Array<{
        entityId: string;
        similarityScore: number;
        commonTags?: any[];
        explanation?: string;
      }> = [];

      // For each candidate, analyze similarity to target
      for (const candidateId of candidateEntities) {
        try {
          const comparison = await this.compareEntityGroups({
            group1: { entityIds: targetEntities, label: "Target Profile" },
            group2: { entityIds: [candidateId], label: "Candidate" },
            compareType: analysisDepth === "deep" ? "both" : "tags",
            options: { take: 10 },
          });

          // Calculate basic similarity score (this is a simplified approach)
          const similarity = this.calculateSimilarityScore(comparison);

          similarities.push({
            entityId: candidateId,
            similarityScore: similarity,
            commonTags: comparison.comparison?.common_tags || [],
            explanation: includeExplanation
              ? this.generateSimilarityExplanation(comparison)
              : undefined,
          });
        } catch (error) {
          console.warn(
            `Failed to analyze similarity for ${candidateId}:`,
            error
          );
        }
      }

      // Sort by similarity score descending
      similarities.sort((a, b) => b.similarityScore - a.similarityScore);

      return {
        success: true,
        targetProfile: targetEntities,
        similarities,
        totalAnalyzed: candidateEntities.length,
        successfulAnalyses: similarities.length,
      };
    } catch (error) {
      console.error("Taste similarity analysis error:", error);
      throw new Error(
        `Failed to analyze taste similarity: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getTrendingEntities(params: {
    category: string;
    location?: string;
    timeframe?: "daily" | "weekly" | "monthly";
    take?: number;
  }) {
    const { category, location, timeframe = "weekly", take = 20 } = params;

    console.log(config.qloo.url);

    try {
      const searchParams = new URLSearchParams();
      searchParams.append("category", category);
      searchParams.append("take", take.toString());

      if (location) {
        searchParams.append("location", location);
      }
      if (timeframe) {
        searchParams.append("timeframe", timeframe);
      }

      const response = await fetch(
        `${config.qloo.url}/trends/category?${searchParams}`,
        {
          headers: {
            "x-api-key": config.qloo.apiKey!,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Trending request failed: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Qloo trending entities error:", error);
      throw new Error(
        `Failed to get trending entities: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getEntityTrendData(entityId: string, weeks?: number) {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append("entity_id", entityId);

      if (weeks) {
        searchParams.append("weeks", weeks.toString());
      }

      const response = await fetch(
        `${config.qloo.url}/trends/entity?${searchParams}`,
        {
          headers: {
            "x-api-key": config.qloo.apiKey!,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Entity trend request failed: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Qloo entity trend error:", error);
      throw new Error(
        `Failed to get entity trend data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }


  private static calculateSimilarityScore(comparison: any): number {
    // This is a simplified scoring algorithm
    // In production, you'd want more sophisticated scoring
    try {
      const results = comparison.comparison;
      if (!results) return 0;

      // Score based on common elements, affinity scores, etc.
      let score = 0;

      // Weight common tags
      if (results.common_tags?.length) {
        score += results.common_tags.length * 0.3;
      }

      // Weight affinity scores if available
      if (results.affinity_difference !== undefined) {
        score += Math.max(0, 1 - Math.abs(results.affinity_difference)) * 0.7;
      }

      return Math.min(1, score); // Normalize to 0-1
    } catch (error) {
      return 0;
    }
  }

  private static generateSimilarityExplanation(comparison: any): string {
    try {
      const results = comparison.comparison;
      if (!results) return "No comparison data available";

      const explanations = [];

      if (results.common_tags?.length) {
        explanations.push(
          `Shares ${results.common_tags.length} common characteristics`
        );
      }

      if (results.unique_to_a?.length) {
        explanations.push(
          `Target has ${results.unique_to_a.length} unique traits`
        );
      }

      if (results.unique_to_b?.length) {
        explanations.push(
          `Candidate has ${results.unique_to_b.length} distinctive traits`
        );
      }

      return explanations.join("; ") || "Analysis completed";
    } catch (error) {
      return "Explanation generation failed";
    }
  }
}

export const qlooProvider = QlooProvider;
