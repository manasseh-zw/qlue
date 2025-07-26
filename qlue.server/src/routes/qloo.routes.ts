import { Hono } from "hono";
import { QlooProvider } from "../providers/qloo/qloo.provider";

const qlooRoutes = new Hono();

// =============================================================================
// INSIGHTS ENDPOINTS - Entity recommendations
// =============================================================================

// Places insights (restaurants, hotels, attractions, etc.)
qlooRoutes.post("/insights/places", async (c) => {
  try {
    const body = await c.req.json();
    const result = await QlooProvider.getPlaceInsights(body);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Movie insights
qlooRoutes.post("/insights/movies", async (c) => {
  try {
    const body = await c.req.json();
    const result = await QlooProvider.getMovieInsights(body);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Artist insights
qlooRoutes.post("/insights/artists", async (c) => {
  try {
    const body = await c.req.json();
    const result = await QlooProvider.getArtistInsights(body);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Podcast insights
qlooRoutes.post("/insights/podcasts", async (c) => {
  try {
    const body = await c.req.json();
    const result = await QlooProvider.getPodcastInsights(body);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Brand insights
qlooRoutes.post("/insights/brands", async (c) => {
  try {
    const body = await c.req.json();
    const result = await QlooProvider.getBrandInsights(body);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Book insights
qlooRoutes.post("/insights/books", async (c) => {
  try {
    const body = await c.req.json();
    const result = await QlooProvider.getBookInsights(body);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Cross-domain profile building
qlooRoutes.post("/insights/cross-domain", async (c) => {
  try {
    const body = await c.req.json();
    const result = await QlooProvider.buildCrossDomainProfile(body);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// =============================================================================
// TAG DISCOVERY ENDPOINTS
// =============================================================================

// Search tags by query
qlooRoutes.get("/tags/search", async (c) => {
  try {
    const query = c.req.query("query");
    const tagTypes = c.req.query("tagTypes")?.split(",");
    const take = c.req.query("take");
    const typoTolerance = c.req.query("typoTolerance") === "true";

    if (!query) {
      return c.json({ error: "Query parameter is required" }, 400);
    }

    const result = await QlooProvider.searchTags(query, {
      tagTypes,
      take: take ? parseInt(take) : undefined,
      typoTolerance,
    });

    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Get tag types
qlooRoutes.get("/tags/types", async (c) => {
  try {
    const parentTypes = c.req.query("parentTypes")?.split(",");
    const result = await QlooProvider.getTagTypes(parentTypes);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Get restaurant tags
qlooRoutes.get("/tags/restaurant", async (c) => {
  try {
    const query = c.req.query("query");
    const result = await QlooProvider.getRestaurantTags(query);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Get music tags
qlooRoutes.get("/tags/music", async (c) => {
  try {
    const query = c.req.query("query");
    const result = await QlooProvider.getMusicTags(query);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Get podcast tags
qlooRoutes.get("/tags/podcast", async (c) => {
  try {
    const query = c.req.query("query");
    const result = await QlooProvider.getPodcastTags(query);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Get movie tags
qlooRoutes.get("/tags/movie", async (c) => {
  try {
    const query = c.req.query("query");
    const result = await QlooProvider.getMovieTags(query);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// =============================================================================
// AUDIENCE ENDPOINTS
// =============================================================================

// Get audiences
qlooRoutes.get("/audiences", async (c) => {
  try {
    const parentTypes = c.req.query("parentTypes")?.split(",");
    const take = c.req.query("take");

    const result = await QlooProvider.getAudiences({
      parentTypes,
      take: take ? parseInt(take) : undefined,
    });

    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Get audience types
qlooRoutes.get("/audiences/types", async (c) => {
  try {
    const result = await QlooProvider.getAudienceTypes();
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Get community audiences
qlooRoutes.get("/audiences/communities", async (c) => {
  try {
    const result = await QlooProvider.getCommunityAudiences();
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// =============================================================================
// SEARCH & LOOKUP ENDPOINTS
// =============================================================================

// Search entities
qlooRoutes.post("/search/entities", async (c) => {
  try {
    const { query, entityType, take } = await c.req.json();

    if (!query) {
      return c.json({ error: "Query parameter is required" }, 400);
    }

    const result = await QlooProvider.searchEntities(query, {
      entityType,
      take,
    });

    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Get entities by IDs
qlooRoutes.post("/entities/lookup", async (c) => {
  try {
    const { entityIds, options } = await c.req.json();
    if (!entityIds || !Array.isArray(entityIds)) {
      return c.json({ error: "entityIds array is required" }, 400);
    }
    const result = await QlooProvider.getEntitiesByIds(entityIds, options);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Resolve entities from names/addresses
qlooRoutes.post("/entities/resolve", async (c) => {
  try {
    const { entities } = await c.req.json();
    if (!entities || !Array.isArray(entities)) {
      return c.json({ error: "entities array is required" }, 400);
    }
    const result = await QlooProvider.resolveEntities(entities);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// =============================================================================
// ANALYSIS & COMPARISON ENDPOINTS
// =============================================================================

// Analyze entities for taste patterns
qlooRoutes.post("/analysis/entities", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.entityIds || !Array.isArray(body.entityIds)) {
      return c.json({ error: "entityIds array is required" }, 400);
    }
    const result = await QlooProvider.analyzeEntities(body);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Compare two groups of entities
qlooRoutes.post("/analysis/compare", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.group1?.entityIds || !body.group2?.entityIds) {
      return c.json(
        { error: "Both group1.entityIds and group2.entityIds are required" },
        400
      );
    }
    const result = await QlooProvider.compareEntityGroups(body);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Analyze taste similarity
qlooRoutes.post("/analysis/similarity", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.targetEntities || !body.candidateEntities) {
      return c.json(
        { error: "Both targetEntities and candidateEntities are required" },
        400
      );
    }
    const result = await QlooProvider.analyzeTasteSimilarity(body);
    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// =============================================================================
// TRENDING ENDPOINTS
// =============================================================================

// Get trending entities by category
qlooRoutes.get("/trends/:category", async (c) => {
  try {
    const category = c.req.param("category");
    const location = c.req.query("location");
    const timeframe = c.req.query("timeframe") as
      | "daily"
      | "weekly"
      | "monthly";
    const take = c.req.query("take");

    const result = await QlooProvider.getTrendingEntities({
      category,
      location,
      timeframe,
      take: take ? parseInt(take) : undefined,
    });

    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Get entity trend data
qlooRoutes.get("/trends/entity/:entityId", async (c) => {
  try {
    const entityId = c.req.param("entityId");
    const weeks = c.req.query("weeks");

    const result = await QlooProvider.getEntityTrendData(
      entityId,
      weeks ? parseInt(weeks) : undefined
    );

    return c.json(result);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// =============================================================================
// UTILITY ENDPOINTS
// =============================================================================

// Validate signals
qlooRoutes.post("/utils/validate-signals", async (c) => {
  try {
    const signals = await c.req.json();
    const isValid = QlooProvider.validateSignals(signals);
    return c.json({ valid: isValid, signals });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Get entity type from string
qlooRoutes.get("/utils/entity-type/:entityType", async (c) => {
  try {
    const entityType = c.req.param("entityType");
    const qlooType = QlooProvider.getEntityTypeFromString(entityType);
    return c.json({ input: entityType, qlooType });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

export { qlooRoutes };
