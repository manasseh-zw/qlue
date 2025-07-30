# Qlue - Real-Time AI Taste Profiling System

## 🚀 What We Built

An intelligent AI agent system that dynamically builds comprehensive taste profiles in real-time, with live WebSocket streaming of the analysis process to create an engaging user experience.

## ✨ Key Features

### 🤖 Intelligent Agent Processing
- **Real-time profiling**: AI agent analyzes user preferences across multiple domains
- **Strategic API calls**: Uses Qloo's cultural intelligence API as intelligent tools
- **Cross-domain insights**: Connects music → food → lifestyle → psychology patterns
- **Progressive discovery**: Each insight informs the next investigation

### 📡 Live WebSocket Streaming
- **Real-time updates**: Users watch as the agent discovers their taste patterns
- **Multiple update types**: Messages, entity discoveries, timeline progress
- **Optimized UX**: 1-second delays between entity updates for smooth experience
- **Smart routing**: Automatic redirects based on processing stages

### 🎯 Complete User Flow
1. **Chat Interface**: Natural conversation to gather interests
2. **Interest Tool**: AI extracts and structures user preferences
3. **Agent Processing**: Real-time taste profile generation
4. **Live Profiler**: Visual feed of agent discoveries
5. **Results Dashboard**: Comprehensive taste profile and recommendations

## 🏗️ Architecture

### Backend Components

#### 1. **Orchestrator** (`orchestrator.ts`)
Central coordinator that manages the entire agent processing pipeline:
- Triggers profiler agent after interests are saved
- Coordinates real-time WebSocket updates
- Manages processing stages and timings
- Handles database storage of results

#### 2. **Enhanced Events** (`event.ts`)
Comprehensive event system for real-time communication:
- `AgentStartedEvent`: Triggers redirect to profiler page
- `MessageUpdateData`: User-friendly agent messages
- `InsightUpdateData`: Entity discoveries with reasoning
- `TimelineUpdateData`: Progress tracking
- `AgentCompletedEvent`: Triggers redirect to results

#### 3. **Profiler Agent** (`profiler.agent.ts`)
Sophisticated AI agent that:
- Parses user interests into structured data
- Resolves entities using Qloo API
- Expands domains to discover patterns
- Generates cross-domain insights
- Synthesizes comprehensive taste profile

#### 4. **WebSocket Manager** (`ws-manager.ts`)
Real-time communication system:
- User-specific connections
- Event broadcasting
- Connection state management
- Message routing

### Frontend Components

#### 1. **Profiler Page** (`/profiler`)
Live agent processing visualization:
- Real-time WebSocket connection
- Timeline progress tracking
- Entity discovery feed
- Agent message streaming

#### 2. **Agent Feed** (`agent-feed.tsx`)
Interactive processing display:
- Vertical timeline component
- Scrollable feed of discoveries
- Animated entity updates
- Progress indicators

#### 3. **Enhanced Feed Components**
- **EntityUpdate**: Displays discovered entities with metadata
- **MessageUpdate**: Shows agent reasoning and stage updates
- **VerticalTimeline**: Progress visualization with status

#### 4. **App Dashboard** (`/app`)
Post-processing results interface:
- Taste profile summary
- Perfect Pitch mode (coming soon)
- Perfect Date mode (coming soon)
- Discovery insights

## 🔄 Processing Flow

### Stage 1: Entity Resolution
```
User Input: "Taylor Swift, Joe Rogan, Korean BBQ"
Agent: 🔍 "Let me parse and categorize your interests..."
→ Resolves entities to Qloo IDs
→ Streams entity discoveries to client
```

### Stage 2: Domain Expansion  
```
Agent: 🌐 "Found interesting patterns! Expanding domains..."
→ Uses resolved entities to find similar preferences
→ Discovers domain-specific insights
→ Streams expanded entities
```

### Stage 3: Cross-Domain Analysis
```
Agent: 🔗 "Connecting dots between your interests..."
→ Analyzes connections between music, food, lifestyle
→ Generates cross-domain pairings
→ Streams cross-domain insights
```

### Stage 4: Final Synthesis
```
Agent: ✨ "Synthesizing your comprehensive taste profile..."
→ Combines all insights into final analysis
→ Generates recommendations and patterns
→ Saves to database
```

## 🛠️ Technical Implementation

### WebSocket Events
```typescript
// Agent lifecycle events
Events.sendToUser(userId, "agent_started", "agent_started", {
  message: "Starting analysis...",
  redirectTo: "/profiler"
});

// Real-time discoveries
Events.sendToUser(userId, "entity_resolution", "insight", {
  entity: { name: "Taylor Swift", ... },
  context: { reasoning: "Key influence in taste profile" }
});

// Processing messages
Events.sendToUser(userId, "domain_expansion", "message", {
  message: "Found fascinating cross-domain patterns...",
  stage: "domain_expansion"
});
```

### Database Schema
```typescript
// Taste profile storage
interface TasteProfileResult {
  primaryEntities: { resolved: [], failed: [] };
  domainExpansions: { [domain]: { entities, reasoning } };
  crossDomainInsights: { pairings, results };
  finalAnalysis: string;
  processingTime: number;
  metadata: { totalEntitiesResolved, domainsExpanded, ... };
}
```

### Client State Management
```typescript
// Real-time state updates
const [insights, setInsights] = useState<InsightData[]>([]);
const [messages, setMessages] = useState<MessageData[]>([]);
const [timeline, setTimeline] = useState<TimelineItem[]>([]);

// WebSocket message handling
websocket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  switch (message.type) {
    case "agent_started": /* redirect to profiler */
    case "insight": setInsights(prev => [...prev, message.data]);
    case "message": setMessages(prev => [...prev, message.data]);
    case "agent_completed": /* redirect to app */
  }
};
```

## 🎨 UI/UX Features

### Visual Timeline
- ✅ Completed stages in primary color
- 🔄 Active stage with spinner animation
- ⏳ Pending stages in muted colors
- Smooth transitions between states

### Entity Discovery Feed
- 🖼️ Entity avatars with fallbacks
- 🏷️ Color-coded domain chips
- 📝 Reasoning explanations
- ⚡ Framer Motion animations

### Agent Messages
- 🎭 Stage-specific emojis
- 💭 Conversational first-person tone
- 🧠 Reasoning transparency
- 🔄 Real-time streaming

## 📊 Testing

### Manual Testing Endpoints
```bash
# Test WebSocket connection
GET /api/test-ws/:userId/status

# Trigger agent processing
POST /api/test-agent-processing/:userId

# Send test feed updates
POST /api/test-agent-feed/:userId
```

### Test Flow
1. Connect to WebSocket: `ws://localhost:8080/ws/{userId}`
2. Trigger processing: `POST /api/test-agent-processing/{userId}`
3. Watch real-time updates in profiler page
4. Verify redirect to app page after completion

## 🚀 Getting Started

### Backend
```bash
cd qlue.server
bun install
bun run dev
```

### Frontend
```bash
cd qlue.client
npm install
npm run dev
```

### Database
```bash
cd qlue.server
npx prisma generate
npx prisma db push
```

## 🔮 Future Enhancements

### Agent Improvements
- **Specialized Agents**: Fashion, food, entertainment agents
- **Agent Collaboration**: Multiple agents working together
- **Learning System**: Agents improve from user interactions

### Real-time Features
- **Voice Streaming**: Audio narration of discoveries
- **Visual Effects**: Particle systems for discoveries
- **Collaborative Sessions**: Multiple users, shared profiles

### Integration
- **API-First**: Expose agent intelligence as API
- **White-Label**: Branded solutions for businesses
- **Platform Integration**: Social media, streaming services

---

**Built with ❤️ using Bun, Hono, WebSockets, TanStack Router, NextUI, and Framer Motion**

*This system represents a breakthrough in AI personalization - not just static profiling, but dynamic investigation that truly understands user preferences.*