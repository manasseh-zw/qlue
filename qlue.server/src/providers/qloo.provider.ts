import { Qloo } from "@devma/qloo";
import { config } from "../../server.config";

const qloo = new Qloo({
  apiKey: config.qloo.apiKey,
});

// Types for better type safety and agent integration
export interface TasteProfile {
  interests: {
    entities: string[];
    tags: string[];
  };
  demographics: {
    age?: 'under_21' | '21_to_34' | '35_to_54' | '55_and_older' | '35_and_younger' | '36_to_55';
    gender?: 'male' | 'female';
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
  
  // =============================================================================
  // CORE INSIGHTS METHODS - Primary recommendation engine
  // =============================================================================

  /**
   * Get place recommendations (restaurants, hotels, attractions, stores)
   * Requires at least one primary signal (entities, tags, or location)
   */
  static async getPlaceInsights(params: {
    signals?: {
      entities?: string[];
      tags?: string[];
      location?: string;
      demographics?: TasteProfile['demographics'];
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
        filterType: 'urn:entity:place',
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
      console.error('Qloo place insights error:', error);
      throw new Error(`Failed to get place insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get movie recommendations based on taste preferences
   */
  static async getMovieInsights(params: {
    signals?: {
      entities?: string[];
      tags?: string[];
      demographics?: TasteProfile['demographics'];
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
        filterType: 'urn:entity:movie',
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
      console.error('Qloo movie insights error:', error);
      throw new Error(`Failed to get movie insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get artist/music recommendations
   */
  static async getArtistInsights(params: {
    signals?: {
      entities?: string[];
      tags?: string[];
      demographics?: TasteProfile['demographics'];
    };
    options?: InsightOptions;
  }) {
    const { signals = {}, options = {} } = params;
    
    try {
      const request: any = {
        filterType: 'urn:entity:artist',
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
      console.error('Qloo artist insights error:', error);
      throw new Error(`Failed to get artist insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get podcast recommendations
   */
  static async getPodcastInsights(params: {
    signals?: {
      entities?: string[];
      tags?: string[];
      demographics?: TasteProfile['demographics'];
    };
    options?: InsightOptions;
  }) {
    const { signals = {}, options = {} } = params;
    
    try {
      const request: any = {
        filterType: 'urn:entity:podcast',
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
      console.error('Qloo podcast insights error:', error);
      throw new Error(`Failed to get podcast insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get brand recommendations
   */
  static async getBrandInsights(params: {
    signals?: {
      entities?: string[];
      tags?: string[];
      demographics?: TasteProfile['demographics'];
    };
    options?: InsightOptions;
  }) {
    const { signals = {}, options = {} } = params;
    
    try {
      const request: any = {
        filterType: 'urn:entity:brand',
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
      console.error('Qloo brand insights error:', error);
      throw new Error(`Failed to get brand insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get book recommendations
   */
  static async getBookInsights(params: {
    signals?: {
      entities?: string[];
      tags?: string[];
      demographics?: TasteProfile['demographics'];
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
        filterType: 'urn:entity:book',
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
      console.error('Qloo book insights error:', error);
      throw new Error(`Failed to get book insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // =============================================================================
  // TAG DISCOVERY METHODS - For finding valid Qloo tags
  // =============================================================================

  /**
   * Search for tags by query string
   * Essential for discovering valid tag IDs for use in insights
   */
  static async searchTags(query: string, options?: {
    tagTypes?: string[];
    take?: number;
    typoTolerance?: boolean;
  }) {
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
      console.error('Qloo tag search error:', error);
      throw new Error(`Failed to search tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available tag types for a domain
   */
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
      console.error('Qloo tag types error:', error);
      throw new Error(`Failed to get tag types: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get restaurant/cuisine tags
   */
  static async getRestaurantTags(query?: string) {
    return this.searchTags(query || '', {
      tagTypes: ['urn:tag:genre:restaurant'],
      take: 30,
    });
  }

  /**
   * Get music genre tags
   */
  static async getMusicTags(query?: string) {
    return this.searchTags(query || '', {
      tagTypes: ['urn:tag:genre:music'],
      take: 30,
    });
  }

  /**
   * Get podcast genre tags
   */
  static async getPodcastTags(query?: string) {
    return this.searchTags(query || '', {
      tagTypes: ['urn:tag:genre:podcast'],
      take: 30,
    });
  }

  /**
   * Get movie genre tags
   */
  static async getMovieTags(query?: string) {
    return this.searchTags(query || '', {
      tagTypes: ['urn:tag:genre:media'],
      take: 30,
    });
  }

  // =============================================================================
  // AUDIENCE DISCOVERY METHODS - For demographic targeting
  // =============================================================================

  /**
   * Get available audiences for demographic targeting
   */
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
      console.error('Qloo audiences error:', error);
      throw new Error(`Failed to get audiences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get audience types/categories
   */
  static async getAudienceTypes() {
    try {
      return await qloo.audiences.getAudienceTypes({
        take: 50,
      });
    } catch (error) {
      console.error('Qloo audience types error:', error);
      throw new Error(`Failed to get audience types: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get community audiences (millennials, gen-z, etc.)
   */
  static async getCommunityAudiences() {
    return this.getAudiences({
      parentTypes: ['urn:audience:communities'],
      take: 30,
    });
  }

  // =============================================================================
  // UTILITY METHODS - Common patterns for agent usage
  // =============================================================================

  /**
   * Build a comprehensive taste profile from multiple entity types
   * Useful for agent to understand cross-domain preferences
   */
  static async buildCrossDomainProfile(params: {
    baseEntities: string[];
    demographics?: TasteProfile['demographics'];
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

      const [places, artists, movies, podcasts, brands] = await Promise.allSettled([
        this.getPlaceInsights({ 
          signals: { ...signals, location }, 
          filters: location ? { location } : {},
          options: { take }
        }),
        this.getArtistInsights({ signals, options: { take } }),
        this.getMovieInsights({ signals, options: { take } }),
        this.getPodcastInsights({ signals, options: { take } }),
        this.getBrandInsights({ signals, options: { take } }),
      ]);

      return {
        places: places.status === 'fulfilled' ? places.value : null,
        artists: artists.status === 'fulfilled' ? artists.value : null,
        movies: movies.status === 'fulfilled' ? movies.value : null,
        podcasts: podcasts.status === 'fulfilled' ? podcasts.value : null,
        brands: brands.status === 'fulfilled' ? brands.value : null,
        errors: [places, artists, movies, podcasts, brands]
          .filter(result => result.status === 'rejected')
          .map(result => (result as PromiseRejectedResult).reason),
      };
    } catch (error) {
      console.error('Cross-domain profile error:', error);
      throw new Error(`Failed to build cross-domain profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Quick entity type detection for agent routing
   */
  static getEntityTypeFromString(entityType: string) {
    const typeMap: Record<string, string> = {
      'restaurant': 'urn:entity:place',
      'place': 'urn:entity:place',
      'hotel': 'urn:entity:place',
      'venue': 'urn:entity:place',
      'movie': 'urn:entity:movie',
      'film': 'urn:entity:movie',
      'artist': 'urn:entity:artist',
      'musician': 'urn:entity:artist',
      'band': 'urn:entity:artist',
      'podcast': 'urn:entity:podcast',
      'show': 'urn:entity:podcast',
      'brand': 'urn:entity:brand',
      'company': 'urn:entity:brand',
      'book': 'urn:entity:book',
      'person': 'urn:entity:person',
      'celebrity': 'urn:entity:person',
    };

    return typeMap[entityType.toLowerCase()] || entityType;
  }

  /**
   * Validate that a request has required primary signals
   */
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
}

// Export default instance for easy access
export const qlooProvider = QlooProvider;