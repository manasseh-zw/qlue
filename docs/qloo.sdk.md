# Qloo TypeScript SDK - LLM Documentation

## About Qloo

Qloo is a cultural intelligence platform that analyzes billions of behavioral signals to understand human taste preferences. The Qloo Insights API helps you discover taste-based connections between entities like places, movies, brands, artists, podcasts, books, and people.

**Core Concept**: Qloo operates on a "signal and filter" model:

- **Signals** = What influences recommendations (interests, demographics, location)
- **Filters** = What constrains and shapes the output (type, location, attributes)

Think of it like asking a taste expert: "Based on someone who likes X, Y, Z (signals), recommend restaurants in NYC under $50 (filters)."

## Installation & Setup

```bash
npm install @devma/qloo
```

```typescript
import { Qloo } from "@devma/qloo";

const qloo = new Qloo({
  apiKey: "your-qloo-api-key",
});
```

## Essential SDK Patterns

### 1. The Signal-Filter Model

**CRITICAL**: Always include at least one primary signal. Demographics alone will fail.

**Primary Signals** (Required - choose at least one):

- `signalInterestsEntities` - Qloo entity IDs that influence taste
- `signalInterestsTags` - Qloo tag IDs (e.g., genres, styles)
- `signalLocation` or `signalLocationQuery` - Geographic influence

**Secondary Signals** (Optional modifiers):

- `signalDemographicsAge` - Age targeting (35_and_younger, 36_to_55, 55_and_older)
- `signalDemographicsGender` - Gender targeting (male, female)
- `signalDemographicsAudiences` - Audience IDs

**Filters** (Shape output):

- `filterType` - REQUIRED: Entity type to return
- `filterLocation*` - Geographic constraints
- `filterTags` - Tag requirements
- `filter*` - Hundreds of attribute filters

### 2. Basic Request Pattern

```typescript
// ✅ CORRECT: Primary signal + filters
const insights = await qloo.insights.getInsights({
  filterType: "urn:entity:place", // Required
  signalInterestsTags: ["urn:tag:genre:restaurant:Italian"], // Primary signal
  signalDemographicsAge: "35_and_younger", // Secondary signal
  filterLocationQuery: "Manhattan", // Filter
  filterPriceLevelMax: 3, // Filter
  take: 10,
});

// ❌ WRONG: Demographics only (will fail)
const badRequest = await qloo.insights.getInsights({
  filterType: "urn:entity:place",
  signalDemographicsAge: "35_and_younger", // Not enough!
  take: 10,
});
```

## Entity Types & Common Use Cases

### Places (`urn:entity:place`)

**Use for**: Restaurants, hotels, attractions, stores, venues

```typescript
// Find Italian restaurants in NYC for young professionals
const restaurants = await qloo.insights.getInsights({
  filterType: "urn:entity:place",
  signalInterestsTags: ["urn:tag:genre:restaurant:Italian"],
  signalDemographicsAge: "35_and_younger",
  filterLocationQuery: "New York City",
  filterPriceLevelMin: 2,
  filterPriceLevelMax: 4,
  take: 10,
});

// Find hotels near specific location based on travel preferences
const hotels = await qloo.insights.getInsights({
  filterType: "urn:entity:place",
  signalInterestsEntities: ["luxury-brand-entity-id"], // Qloo entity ID
  signalLocation: "POINT(-73.99823 40.722668)", // NYC coordinates
  filterHotelClassMin: 4,
  filterLocationRadius: 5000, // 5km radius
  take: 5,
});

// Find places that match someone who likes Starbucks
const coffeeShops = await qloo.insights.getInsights({
  filterType: "urn:entity:place",
  signalInterestsEntities: ["starbucks-qloo-entity-id"],
  filterLocationQuery: "San Francisco",
  take: 15,
});
```

### Movies (`urn:entity:movie`)

**Use for**: Film recommendations based on taste preferences

```typescript
// Horror movies for male audiences released after 2020
const horrorMovies = await qloo.insights.getInsights({
  filterType: "urn:entity:movie",
  signalInterestsTags: ["urn:tag:genre:media:horror"],
  signalDemographicsGender: "male",
  filterReleaseYearMin: 2020,
  filterContentRating: "R",
  take: 10,
});

// Movies similar to specific films
const similarMovies = await qloo.insights.getInsights({
  filterType: "urn:entity:movie",
  signalInterestsEntities: ["inception-qloo-id", "interstellar-qloo-id"],
  signalDemographicsAge: "36_to_55",
  filterReleaseYearMin: 2015,
  take: 8,
});
```

### Artists (`urn:entity:artist`)

**Use for**: Music artist recommendations

```typescript
// Find artists similar to Taylor Swift for young females
const artists = await qloo.insights.getInsights({
  filterType: "urn:entity:artist",
  signalInterestsEntities: ["taylor-swift-qloo-id"],
  signalDemographicsGender: "female",
  signalDemographicsAge: "35_and_younger",
  take: 10,
});

// Discover artists by genre preferences
const popArtists = await qloo.insights.getInsights({
  filterType: "urn:entity:artist",
  signalInterestsTags: ["urn:tag:genre:music:pop", "urn:tag:genre:music:indie"],
  operatorFilterTags: "union", // OR logic
  take: 12,
});
```

### Podcasts (`urn:entity:podcast`)

**Use for**: Podcast recommendations

```typescript
// Comedy podcasts for young adults
const comedyPodcasts = await qloo.insights.getInsights({
  filterType: "urn:entity:podcast",
  signalInterestsTags: ["urn:tag:genre:podcast:comedy"],
  signalDemographicsAge: "35_and_younger",
  take: 10,
});

// Podcasts similar to specific shows
const similarPodcasts = await qloo.insights.getInsights({
  filterType: "urn:entity:podcast",
  signalInterestsEntities: ["joe-rogan-podcast-qloo-id"],
  signalDemographicsGender: "male",
  take: 8,
});
```

### Books (`urn:entity:book`)

**Use for**: Book recommendations

```typescript
// Science fiction books published recently
const sciFiBooks = await qloo.insights.getInsights({
  filterType: "urn:entity:book",
  signalInterestsTags: ["urn:tag:genre:book:science_fiction"],
  filterPublicationYearMin: 2020,
  take: 10,
});
```

### Brands (`urn:entity:brand`)

**Use for**: Brand affinity and similar brand discovery

```typescript
// Brands similar to Nike for athletes
const athleticBrands = await qloo.insights.getInsights({
  filterType: "urn:entity:brand",
  signalInterestsEntities: ["nike-qloo-id"],
  signalInterestsTags: ["urn:tag:category:athletics"],
  take: 10,
});
```

### People (`urn:entity:person`)

**Use for**: Celebrity, influencer, or public figure recommendations

```typescript
// Actors similar to Ryan Gosling
const actors = await qloo.insights.getInsights({
  filterType: "urn:entity:person",
  signalInterestsEntities: ["ryan-gosling-qloo-id"],
  filterDateOfBirthMin: "1980-01-01",
  filterDateOfBirthMax: "1990-12-31",
  take: 8,
});
```

## Advanced Features

### Explainability

Get insights into WHY recommendations were made:

```typescript
const explainableResults = await qloo.insights.getInsights({
  filterType: "urn:entity:place",
  signalInterestsTags: ["urn:tag:genre:restaurant:Italian"],
  signalLocationQuery: "Brooklyn",
  featureExplainability: true, // Enable explanations
  take: 5,
});

// Response includes query.explainability showing which signals influenced each result
```

### Diversification

Prevent monotonous results:

```typescript
const diverseRestaurants = await qloo.insights.getInsights({
  filterType: "urn:entity:place",
  signalLocationQuery: "New York City",
  diversifyBy: "properties.geocode.city", // Diversify by city
  diversifyTake: 3, // Max 3 results per city
  take: 15,
});
```

### Weight Signals (POST requests only)

Give different importance to different signals:

```typescript
// Note: Weighted signals require POST requests
const weightedResults = await fetch("/insights", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    "filter.type": "urn:entity:place",
    "signal.interests.entities": [
      { entity: "high-end-restaurant-id", weight: 25 },
      { entity: "casual-dining-id", weight: 10 },
    ],
  }),
});
```

## Entity Discovery

**IMPORTANT**: Entity IDs are Qloo-specific internal identifiers. You cannot use arbitrary UUIDs.

### Find Entity IDs by Name (POST requests)

```typescript
// Find entities by name/address for use as signals
const entitySearch = await fetch("/insights", {
  method: "POST",
  body: JSON.stringify({
    "filter.type": "urn:entity:place",
    "signal.interests.entities.query": [
      { name: "Starbucks", address: "123 Main St, New York" },
      "Balthazar", // Simple string search
      { name: "Naya", address: "ny", resolve_to: "both" },
    ],
  }),
});
```

### Tag Discovery

Use the Tags API to find valid tag IDs:

```typescript
const tags = await qloo.tags.getTags({
  filterQuery: "italian",
  filterTagTypes: ["urn:tag:genre:restaurant"],
  take: 10,
});
```

## Audiences API

### Get Available Audiences

```typescript
const audiences = await qloo.audiences.getAudiences({
  filterParentsTypes: ["urn:audience:communities"],
  take: 20,
});

// Use audience IDs in insights
const audienceInsights = await qloo.insights.getInsights({
  filterType: "urn:entity:place",
  signalDemographicsAudiences: ["urn:audience:millennials"],
  signalLocationQuery: "San Francisco",
  take: 10,
});
```

### Get Audience Types

```typescript
const audienceTypes = await qloo.audiences.getAudienceTypes({
  take: 50,
});
```

## Tags API

### Search Tags

```typescript
const tags = await qloo.tags.getTags({
  filterQuery: "vegan", // Search for vegan-related tags
  featureTypoTolerance: true, // Allow typos
  take: 20,
});
```

### Get Tag Types

```typescript
const tagTypes = await qloo.tags.getTagTypes({
  filterParentsTypes: ["urn:tag:genre:restaurant"],
  take: 30,
});
```

## Common Filtering Patterns

### Location-Based Filtering

```typescript
// Specific city
filterLocationQuery: 'Manhattan'

// Geographic coordinates with radius
filterLocation: 'POINT(-73.99823 40.722668)',
filterLocationRadius: 5000

// Exclude specific areas
filterExcludeLocationQuery: 'Times Square'

// Multiple cities (POST only)
'filter.location.query': ['Miami', 'Miami Beach']
```

### Price & Rating Filters

```typescript
// Price level (1-4 scale like $ to $$$$)
filterPriceLevelMin: 2,
filterPriceLevelMax: 4,

// Specific price ranges
filterPriceRangeFrom: 100,
filterPriceRangeTo: 300,

// Ratings
filterRatingMin: 4.0,
filterPopularityMin: 0.8 // Top 20%
```

### Content & Attribute Filters

```typescript
// Movies
filterContentRating: 'PG-13',
filterReleaseYearMin: 2020,
filterReleaseCountry: ['United States'],

// Hotels
filterHotelClassMin: 4,
filterExternalExists: 'resy,michelin', // Must have Resy and Michelin data

// Restaurants
filterHours: 'monday', // Open on Mondays
filterExternalResyRatingMin: 4.0
```

## Error Handling & Troubleshooting

### Common Errors

1. **"at least one valid signal or filter is required"**

   - Add a primary signal: `signalInterestsEntities`, `signalInterestsTags`, or `signalLocation`
   - Demographics alone are insufficient

2. **Invalid entity IDs**

   - Use entity search to find valid Qloo entity IDs
   - Don't use arbitrary UUIDs

3. **Invalid tag formats**
   - Tags follow pattern: `urn:tag:genre:{domain}:{value}`
   - Use Tags API to discover valid tags

### Error Handling Code

```typescript
import { QlooError } from "@devma/qloo";

try {
  const insights = await qloo.insights.getInsights({
    filterType: "urn:entity:place",
    signalInterestsTags: ["urn:tag:genre:restaurant:Italian"],
    take: 10,
  });
} catch (error) {
  if (error instanceof QlooError) {
    console.error("Qloo API Error:", error.message);
    console.error("Status Code:", error.statusCode);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## Response Structure

All APIs return a consistent structure:

```typescript
{
  success: boolean;
  results: {
    entities: Array<{
      name: string;
      entity_id: string;
      type: string;
      subtype: string;
      properties: object;
      // ... entity-specific data
    }>;
    duration: number;
  };
  query?: {
    explainability?: object; // When feature.explainability=true
    locality?: object;       // When location queries are used
  };
}
```

## Best Practices for LLMs

### 1. Always Start with Primary Signals

Never make requests with only demographics. Always include:

- Entity IDs (`signalInterestsEntities`)
- Tags (`signalInterestsTags`)
- Location (`signalLocation` or `signalLocationQuery`)

### 2. Use Meaningful Combinations

Combine signals for richer results:

```typescript
// Good: Multiple signal types
{
  signalInterestsTags: ['urn:tag:genre:restaurant:Italian'],
  signalDemographicsAge: '35_and_younger',
  signalLocationQuery: 'Manhattan'
}
```

### 3. Apply Relevant Filters

Match filters to entity types:

- Places: location, price, rating, hours
- Movies: release year, content rating, genre
- People: birth dates, gender

### 4. Handle Pagination

For large result sets:

```typescript
// Use page for clean pagination
const page1 = await qloo.insights.getInsights({
  filterType: "urn:entity:place",
  signalLocationQuery: "New York City",
  page: 1,
  take: 20,
});
```

### 5. Leverage Explainability

When you need to understand WHY:

```typescript
featureExplainability: true;
```

## Quick Reference: Required Parameters

- **All Insights requests**: `filterType` (required)
- **Effective requests**: At least one primary signal
- **Location-based**: `signalLocation` or `filterLocation`
- **Taste-based**: `signalInterestsEntities` or `signalInterestsTags`
- **Audience requests**: No required parameters beyond standard pagination

## Entity Type Quick Reference

| Entity Type          | Use For                     | Common Filters                      |
| -------------------- | --------------------------- | ----------------------------------- |
| `urn:entity:place`   | Restaurants, hotels, venues | location, price, rating, hours      |
| `urn:entity:movie`   | Films                       | release_year, content_rating, genre |
| `urn:entity:artist`  | Musicians                   | genre tags                          |
| `urn:entity:podcast` | Podcasts                    | genre tags                          |
| `urn:entity:book`    | Books                       | publication_year, genre             |
| `urn:entity:brand`   | Companies, brands           | industry tags                       |
| `urn:entity:person`  | Celebrities, public figures | birth_date, gender                  |

This SDK provides comprehensive access to Qloo's cultural intelligence platform. Always combine signals thoughtfully and apply relevant filters to get the most meaningful taste-based recommendations.
