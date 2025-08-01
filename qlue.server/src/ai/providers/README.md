# Tavus Integration

This directory contains the Tavus video conversation integration for Qlue.

## Components

### TavusProvider (`tavus.provider.ts`)

Direct API wrapper for Tavus conversations. Handles:

- Creating conversations
- Getting conversation details
- Ending conversations
- Deleting conversations

### TavusService (`tavus.service.ts`)

Business logic layer that:

- Generates system prompts based on conversation mode
- Creates conversational context from user taste profiles
- Generates custom greetings
- Manages conversation creation with taste analysis

### TasteProfileService (`taste-profile.service.ts`)

Database service for:

- Retrieving user taste profiles
- Saving taste profiles
- Converting between database and application formats

## API Endpoints

### Create Conversation

```
POST /ai/tavus/conversation
```

**Request Body:**

```json
{
  "personaId": "string (required)",
  "replicaId": "string (optional)",
  "mode": "perfect_pitch" | "taste_critic" | "adaptive_conversation",
  "customGreeting": "string (optional)"
}
```

**Response:**

```json
{
  "conversationId": "string",
  "conversationUrl": "string",
  "conversationName": "string",
  "status": "string"
}
```

### Get Conversation

```
GET /ai/tavus/conversation/:conversationId
```

### End Conversation

```
POST /ai/tavus/conversation/:conversationId/end
```

### Delete Conversation

```
DELETE /ai/tavus/conversation/:conversationId
```

## Conversation Modes

### Perfect Pitch Mode

- Analyzes user's lifestyle and preferences
- Identifies pain points and desires
- Frames pitches around specific interests
- Uses cultural touchstones for emotional connections

### Taste Critic Mode

- Analyzes taste patterns and cultural choices
- Explains psychological significance of preferences
- Suggests connections between different domains
- Recommends new discoveries based on existing preferences

### Adaptive Conversation Mode

- Matches communication style and energy
- References interests naturally
- Asks thoughtful follow-up questions
- Creates comfortable, friendly atmosphere

## Environment Variables

Add to your `.env` file:

```
TAVUS_API_KEY=your_tavus_api_key
TAVUS_URL=https://tavusapi.com
```

## Usage Example

```typescript
import { TavusService } from "./providers/tavus.service";
import { TasteProfileService } from "./providers/taste-profile.service";

const tavusService = new TavusService();
const tasteProfileService = new TasteProfileService();

// Get user's taste profile
const tasteProfile = await tasteProfileService.getUserTasteProfile(userId);

// Create conversation
const conversation = await tavusService.createConversation(
  {
    userId,
    personaId: "your_persona_id",
    mode: "perfect_pitch",
  },
  tasteProfile
);

// Use conversation URL
console.log(conversation.conversationUrl);
```
