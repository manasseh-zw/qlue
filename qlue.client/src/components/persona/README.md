# Persona Components

This directory contains components for managing Tavus video conversations with AI personas using the official Tavus CVI SDK.

## Components

### StartConversation (`conversation.tsx`)

A button component that handles:

- Creating Tavus conversations via the backend API
- Navigating to the meet page with the conversation URL
- Error handling and loading states

### Meet Page (`/routes/__app/meet/index.tsx`)

The meet page now uses the proper Tavus CVI SDK components:

- **CVIProvider**: Wraps the entire app with Tavus CVI context
- **Conversation**: The main video conversation component with:
  - Real-time audio/video processing
  - Device management (camera, microphone, screen sharing)
  - Built-in noise cancellation
  - Customizable UI controls
  - Proper error handling

## Features

- **Perfect Pitch Mode**: Charlie analyzes user taste profiles to craft personalized sales pitches
- **Taste Critic Mode**: Cultural analysis and taste pattern insights
- **Adaptive Conversation Mode**: Natural, flowing conversations that adapt to user preferences

## Implementation Details

### Tavus CVI SDK Integration

The implementation now uses the official `@tavus/cvi-ui` package which provides:

- Pre-built video chat components
- Device management (camera, microphone, screen sharing)
- Real-time audio/video processing
- Customizable styling and theming
- TypeScript support with full type definitions
- Built-in noise cancellation via Daily.co

### Key Components

1. **CVIProvider** (`src/components/cvi/components/cvi-provider/index.tsx`)
   - Wraps the app with Daily.co provider
   - Required for all CVI components

2. **Conversation** (`src/components/cvi/components/conversation/index.tsx`)
   - Main video conversation component
   - Handles video/audio streams
   - Provides device controls
   - Manages call lifecycle

3. **Device Controls** (`src/components/cvi/components/device-select/`)
   - Camera selection
   - Microphone selection
   - Screen sharing controls

## Usage

```tsx
import { StartConversation } from "../../../components/persona/conversation";

// In your component
const persona = {
  personaId: "p4fcc991a271",
  replicaId: "rb17cf590e15",
  mode: "perfect_pitch",
  title: "Charlie - Sales Lead",
};

<StartConversation persona={persona} />
```

## Backend Integration

The conversation component integrates with the backend API endpoints:

- `POST /ai/tavus/conversation` - Create conversation
- `GET /ai/tavus/conversation/:id` - Get conversation details
- `POST /ai/tavus/conversation/:id/end` - End conversation
- `DELETE /ai/tavus/conversation/:id` - Delete conversation

## Environment Variables

Add to your `.env` file:

```
VITE_API_URL=http://localhost:8080
```

## Current Personas

1. **Charlie - Sales Lead** (Perfect Pitch Mode)
   - Persona ID: `p4fcc991a271`
   - Replica ID: `rb17cf590e15`
   - Analyzes taste profiles for personalized sales pitches

2. **Creative Director** (Taste Critic Mode)
   - Placeholder configuration
   - Cultural analysis and creative insights

3. **Business Strategist** (Adaptive Conversation Mode)
   - Placeholder configuration
   - Natural conversation flow

## Migration from iframe

The previous implementation used a basic iframe approach which had limitations:

- ❌ No device management
- ❌ No real-time controls
- ❌ Limited customization
- ❌ Poor error handling

The new CVI SDK implementation provides:

- ✅ Full device management
- ✅ Real-time audio/video controls
- ✅ Built-in noise cancellation
- ✅ Proper error handling
- ✅ TypeScript support
- ✅ Customizable UI
- ✅ Better performance 