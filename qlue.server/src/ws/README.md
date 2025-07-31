# WebSocket Test Endpoint

This directory contains a test endpoint for simulating profiler agent updates without triggering the actual AI processing.

## How to Use

### 1. Enable Test Mode
In `qlue.client/src/client.config.ts`, ensure `testMode` is set to `true`:

```typescript
export const config = {
  serverUrl: import.meta.env.VITE_SERVER_URL || "http://localhost:8080",
  // 🧪 Test mode - set to false to remove test functionality
  testMode: true,
} as const;
```

### 2. Navigate to Profiler Page
Go to `/profiler` in your application. You should see a yellow "🧪 Test Profiler" button.

### 3. Trigger Test Simulation
Click the "🧪 Start Test Loop" button to trigger a continuous simulated profiler flow that includes:
- Entity resolution messages
- Timeline updates
- Insight streaming
- Cross-domain analysis
- Final synthesis
- **Auto-restart**: The simulation will automatically restart after completion for continuous testing

### 4. Stop the Test Loop
Click the "🛑 Stop Test Loop" button to stop the continuous simulation when you're done testing.

### 5. Disable Test Mode for Production
When ready for production, simply set `testMode: false` in the client config.

## Test Flow

The test simulation follows the same flow as the real profiler agent:

1. **Entity Resolution** - Simulates resolving user interests
2. **Domain Expansion** - Shows related entities in each domain
3. **Cross-Domain Analysis** - Demonstrates connections between domains
4. **Final Synthesis** - Completes the profile generation

## Files

- `test-profiler.ts` - Contains the simulation logic and test data
- `ws.ts` - WebSocket handler with test endpoint integration
- `ws-manager.ts` - WebSocket connection management

## Test Data

The simulation uses realistic test entities:
- **Music**: Taylor Swift, Lorde
- **Books**: The Great Gatsby, 1984
- **TV Shows**: Breaking Bad, Fleabag

This allows you to test the UI components and user experience without consuming AI credits or making external API calls.

## Continuous Testing

The test simulation now includes:
- **Auto-restart**: Automatically restarts after completion
- **Stop control**: Red button to stop the continuous loop
- **State reset**: Clears previous data when starting a new test
- **Real-time updates**: See your UI changes immediately as the simulation runs

Perfect for rapid iteration and testing UI changes without restarting the simulation! 