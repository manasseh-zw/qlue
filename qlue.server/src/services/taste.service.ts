import {
  SignalDemographicsAge,
  SignalDemographicsGender,
} from "@devma/qloo/dist/commonjs/models/operations";
import {
  getEntityTypeFromString,
  qlooProvider,
} from "../providers/qloo.provider";

type QlooEntity = {
  name: string;
  entity_id: string;
  properties: {
    description: string;
    short_description: string;
    popularity: string;
    image: {
      url: string;
    };
  };
  tags?: Array<{
    name: string;
    tag_id: string;
    value: string;
  }>;
};

export type InsightRequest = {
  entityIds: string[];
  tags?: string[];
  outputType: string;
  age?: string;
  gender?: string;
  take?: number;
};

export type EntityResolutionRequest = {
  query: string;
  type: string;
};

export type ResolvedEntity = {
  input: EntityResolutionRequest;
  resolved: QlooEntity | null;
  alternatives: QlooEntity[];
  error?: string;
};

export type CrossDomainProfileRequest = {
  entities: Array<EntityResolutionRequest>;
  domains: string[];
  demographics?: {
    age?: string;
    gender?: string;
  };
  location?: {
    query?: string;
    coordinates?: string;
    radius?: number;
  };
  options?: {
    take?: number;
    confidence?: number;
    diversify?: boolean;
  };
};

export type CrossDomainProfileResult = {
  profile: {
    entities: ResolvedEntity[];
    demographics: CrossDomainProfileRequest['demographics'];
    location: CrossDomainProfileRequest['location'];
  };
  insights: {
    [domain: string]: {
      entities: QlooEntity[];
      tags?: any[];
      total: number;
    };
  };
  summary: {
    totalEntities: number;
    successfulResolutions: number;
    domainsAnalyzed: number;
    totalInsights: number;
  };
};

export async function getInsights(request: InsightRequest) {
  try {
    const insights = await qlooProvider.getInsights({
      signalInterestsEntities: request.entityIds,
      ...(request.tags?.length ? { signalInterestsTags: request.tags } : {}),
      filterType: getEntityTypeFromString(request.outputType),
      signalDemographicsAge: request.age as SignalDemographicsAge,
      signalDemographicsGender: request.gender as SignalDemographicsGender,
      take: request.take || 10,
    });

    if (!insights.results?.entities?.length) {
      return "No insights found";
    }

    return transformToQlooEntities(insights.results.entities);
  } catch (error) {
    console.error("Get insights error:", error);
    throw new Error(
      `Failed to get insights: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function resolveEntities(
  entities: Array<EntityResolutionRequest>
): Promise<{
  success: boolean;
  resolved: ResolvedEntity[];
  total: number;
  successful: number;
}> {
  try {
    const resolvedEntities: ResolvedEntity[] = [];

    for (const entityRequest of entities) {
      try {
        const result = await qlooProvider.searchEntities(entityRequest.query, {
          entityType: entityRequest.type,
          take: 5,
        });

        if (result.results?.length > 0) {
          resolvedEntities.push({
            input: entityRequest,
            resolved: result.results[0] as QlooEntity,
            alternatives: result.results.slice(1, 3) as QlooEntity[],
          });
        } else {
          resolvedEntities.push({
            input: entityRequest,
            resolved: null,
            alternatives: [],
          });
        }
      } catch (error) {
        console.warn(
          `Failed to resolve entity "${entityRequest.query}" (${entityRequest.type}):`,
          error
        );
        resolvedEntities.push({
          input: entityRequest,
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
      successful: resolvedEntities.filter((r) => r.resolved !== null).length,
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

export async function crossDomainProfile(
  request: CrossDomainProfileRequest
): Promise<CrossDomainProfileResult> {
  try {
    // Step 1: Resolve all entities
    const resolvedEntities = await resolveEntities(request.entities);
    
    if (!resolvedEntities.success || resolvedEntities.successful === 0) {
      throw new Error("No entities could be resolved");
    }

    // Step 2: Extract successfully resolved entity IDs
    const entityIds = resolvedEntities.resolved
      .filter(r => r.resolved)
      .map(r => r.resolved!.entity_id);

    // Step 3: Get insights for each domain
    const insights: CrossDomainProfileResult['insights'] = {};
    
    for (const domain of request.domains) {
      try {
        const domainInsights = await qlooProvider.getInsights({
          signalInterestsEntities: entityIds,
          filterType: getEntityTypeFromString(domain),
          signalDemographicsAge: request.demographics?.age as SignalDemographicsAge,
          signalDemographicsGender: request.demographics?.gender as SignalDemographicsGender,
          signalInterestsEntitiesWeight:10,
          take: request.options?.take || 15,
        });

        if (domainInsights.results?.entities?.length) {
          insights[domain] = {
            entities: transformToQlooEntities(domainInsights.results.entities),
            total: domainInsights.results.entities.length,
          };
        } else {
          insights[domain] = {
            entities: [],
            total: 0,
          };
        }
      } catch (error) {
        console.warn(`Failed to get insights for domain "${domain}":`, error);
        insights[domain] = {
          entities: [],
          total: 0,
        };
      }
    }

    // Step 4: Calculate summary
    const totalInsights = Object.values(insights).reduce(
      (sum, domain) => sum + domain.total,
      0
    );

    const result: CrossDomainProfileResult = {
      profile: {
        entities: resolvedEntities.resolved,
        demographics: request.demographics,
        location: request.location,
      },
      insights,
      summary: {
        totalEntities: request.entities.length,
        successfulResolutions: resolvedEntities.successful,
        domainsAnalyzed: request.domains.length,
        totalInsights,
      },
    };

    return result;
  } catch (error) {
    console.error("Cross-domain profile error:", error);
    throw new Error(
      `Failed to create cross-domain profile: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

function transformToQlooEntities(entities: any[]): QlooEntity[] {
  return entities.map(transformToQlooEntity);
}
function transformToQlooEntity(entity: any): QlooEntity {
  // Find English short description, fallback to first available
  let shortDescription = "";
  if (entity.properties?.short_descriptions?.length) {
    const englishDesc = entity.properties.short_descriptions.find((desc: any) =>
      desc.languages?.includes("en")
    );
    shortDescription =
      englishDesc?.value ||
      entity.properties.short_descriptions[0]?.value ||
      "";
  } else {
    shortDescription = entity.properties?.short_description || "";
  }

  // Extract top 3 tags
  const tags = entity.tags?.slice(0, 3).map((tag: any) => ({
    name: tag.name || "",
    tag_id: tag.tag_id || "",
    value: tag.value || "",
  })) || [];

  return {
    name: entity.name,
    entity_id: entity.entity_id,
    properties: {
      description: entity.properties?.description || "",
      short_description: shortDescription,
      popularity: entity.popularity?.toString() || "0",
      image: {
        url: entity.properties?.image?.url || "",
      },
    },
    tags,
  };
}
