```ts
// Test route to send agent feed updates
app.post("/api/test-agent-feed/:userId", async (c) => {
  const userId = c.req.param("userId");
  const body = await c.req.json();

  console.log("Sending agent feed update to user:", userId);

  // Send timeline update
  Events.sendToUser(userId, "timeline_update", {
    timeline: [
      {
        id: "1",
        text: "Gathering Information",
        status: "completed",
        type: "question",
      },
      {
        id: "2",
        text: "Analyzing Data",
        status: "in_progress",
        type: "analysis",
      },
      {
        id: "3",
        text: "Synthesizing Results",
        status: "pending",
        type: "synthesis",
      },
    ],
  });

  // Send insight update
  Events.sendToUser(userId, "insight", {
    insights: [
      "New insight: Market trends analysis complete",
      "Competitor analysis in progress",
      "Growth opportunities identified",
    ],
  });

  // Send agent update
  Events.sendToUser(userId, "agent_update", {
    agentName: "AI Assistant",
    currentStage: body.stage || "Analyzing",
    progress: body.progress || 75,
  });

  return c.json({
    success: true,
    message: "Agent feed updates sent",
    userId,
  });
});

// Test route to manually trigger agent processing
app.post("/api/test-agent-processing/:userId", async (c) => {
  const userId = c.req.param("userId");

  // Mock user interests for testing
  const mockInterests = {
    name: "Test User",
    age: 28,
    gender: "female",
    location: "New York",
    artists: ["Taylor Swift", "Billie Eilish"],
    podcasts: ["The Joe Rogan Experience"],
    booksShowsMovies: ["Game of Thrones", "Inception"],
    hobbiesOther: ["Photography", "Cooking"],
  };

  try {
    // Import the orchestrator dynamically to avoid circular dependencies
    const { orchestrator } = await import("./ai/orchestrator");

    // Start agent processing
    orchestrator.startAgentProcessing(userId, mockInterests);

    return c.json({
      success: true,
      message: "Agent processing started for user",
      userId,
      mockData: mockInterests,
    });
  } catch (error) {
    console.error("Error starting agent processing:", error);
    return c.json(
      {
        success: false,
        message: "Failed to start agent processing",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Test route to check if user is online
app.get("/api/test-ws/:userId/status", (c) => {
  const userId = c.req.param("userId");
  const isOnline = Events.isUserOnline(userId);

  return c.json({
    userId,
    isOnline,
    message: isOnline ? "User is connected" : "User is not connected",
  });
});
```
