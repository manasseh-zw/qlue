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
};

export type InsightRequest = {
  entityIds: string[];
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

export async function getInsights(request: InsightRequest) {
  try {
    const insights = await qlooProvider.getInsights({
      signalInterestsEntities: request.entityIds,
      filterType: getEntityTypeFromString(request.outputType),
      signalDemographicsAge: request.age as SignalDemographicsAge,
      signalDemographicsGender: request.gender as SignalDemographicsGender,
      take: request.take || 20,
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
  };
}
