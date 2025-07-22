# Qloo API Behavior & Insights

## Key Discoveries

### Required Signals for Insights

Qloo's insights API requires **at least one primary signal** to generate recommendations. Demographics alone are insufficient.

#### ✅ Valid Primary Signals

1. **`signal.interests.entities`** - Qloo entity IDs (e.g., `B8BEE72B-B321-481F-B81A-A44881D094D6`)
2. **`signal.interests.tags`** - Qloo tag IDs (e.g., `urn:tag:genre:podcast:comedy`)
3. **`signal.location`** / **`signal.location.query`** - Geographic signals

#### ❌ Insufficient Signals (Used Alone)

- **`signal.demographics.age`** - Age targeting
- **`signal.demographics.gender`** - Gender targeting
- **`signal.demographics.audiences`** - Audience targeting

### Entity IDs Are Qloo-Specific

- Entity IDs like `B8BEE72B-B321-481F-B81A-A44881D094D6` are **internal Qloo identifiers**
- These IDs reference entities in Qloo's knowledge graph
- You cannot use arbitrary UUIDs - they must exist in Qloo's system
- Qloo provides entity search/resolution capabilities to find valid IDs

### Demographics as Modifiers

Demographics parameters **modify** and **weight** recommendations rather than drive them:

- They influence the ranking and scoring of results
- They personalize results based on demographic preferences
- They must be combined with primary signals to work

## API Patterns

### Working Pattern 1: Entity + Demographics

```http
GET /insights?filter.type=urn:entity:podcast&signal.interests.entities=B8BEE72B-B321-481F-B81A-A44881D094D6&signal.demographics.age=35_and_younger&take=10
```

### Working Pattern 2: Tags + Demographics

```http
GET /insights?filter.type=urn:entity:podcast&signal.interests.tags=urn:tag:genre:podcast:comedy&signal.demographics.age=35_and_younger&take=10
```

### Working Pattern 3: Location + Demographics

```http
GET /insights?filter.type=urn:entity:place&signal.location.query=New York City&signal.demographics.age=35_and_younger&take=10
```

### ❌ Failing Pattern: Demographics Only

```http
GET /insights?filter.type=urn:entity:podcast&signal.demographics.age=35_and_younger&take=10
```

**Error:** `"at least one valid signal or filter is required for entity insights"`

## Entity Resolution

Qloo provides mechanisms to find entity IDs:

### 1. Entity Query (POST requests)

- **`signal.interests.entities.query`** - Find entities by name/address
- **`filter.results.entities.query`** - Search entities for filtering
- **`filter.exclude.entities.query`** - Find entities to exclude

### 2. Format Options

```json
// Object format with name and address
{
  "name": "Starbucks",
  "address": "123 Main St, New York"
}

// Simple string search
"Starbucks"

// With resolution preference
{
  "name": "Naya",
  "address": "ny",
  "resolve_to": "both"  // "place", "brand", or "both"
}
```

## Response Patterns

### Successful Response

```json
{
  "success": true,
  "results": {
    "entities": [
      {
        "name": "My Dad Wrote A Porno",
        "entity_id": "C1FF708E-8DFF-4C50-A6CF-1A99AC27AA6F",
        "type": "urn:entity",
        "subtype": "urn:entity:podcast"
        // ... more entity data
      }
    ],
    "duration": 0.123
  }
}
```

### Error Response (Insufficient Signals)

```json
{
  "errors": [
    {
      "message": "at least one valid signal or filter is required for entity insights"
    }
  ]
}
```

## Best Practices

### 1. Always Combine Signals

- Start with a primary signal (entity, tag, or location)
- Add demographics to personalize results
- Use multiple signals for richer recommendations

### 2. Entity Discovery Workflow

1. Use entity search to find valid Qloo entity IDs
2. Use those IDs in `signal.interests.entities`
3. Combine with demographics and filters for targeted results

### 3. Tag Discovery

- Use the `/tags` endpoint to find valid tag IDs
- Tags follow the pattern: `urn:tag:genre:{domain}:{value}`
- Examples: `urn:tag:genre:restaurant:Italian`, `urn:tag:genre:media:horror`

### 4. Location Flexibility

- Use `signal.location.query` for human-readable location names
- Use `signal.location` for precise WKT coordinates
- Location signals work well with all entity types

## Common Entity Types & Use Cases

| Entity Type          | Primary Signals            | Common Demographics    | Example Use Case                                |
| -------------------- | -------------------------- | ---------------------- | ----------------------------------------------- |
| `urn:entity:podcast` | Tags, Entity IDs           | Age, Gender            | Find comedy podcasts for young adults           |
| `urn:entity:place`   | Location, Tags, Entity IDs | Age, Gender, Location  | Find Italian restaurants in NYC for millennials |
| `urn:entity:movie`   | Tags, Entity IDs           | Age, Gender            | Find horror movies for male audiences           |
| `urn:entity:brand`   | Entity IDs, Tags           | Age, Gender, Audiences | Find fashion brands similar to Nike             |

## Error Prevention

### Before Making Requests

1. Verify entity IDs exist in Qloo's system
2. Use valid tag formats and IDs
3. Include at least one primary signal
4. Validate location queries resolve to known localities

### Common Fixes for "No Valid Signal" Error

1. Add `signal.interests.tags` with a valid tag
2. Add `signal.location.query` with a city name
3. Add `signal.interests.entities` with a valid Qloo entity ID
4. Remove demographics-only queries and add primary signals

https://hackathon.api.qloo.com/search?query=Beyonce direct search
