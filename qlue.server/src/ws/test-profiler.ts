import { WebSocketManager } from "./ws-manager";
import { EventType } from "./event";

// Track running simulations to allow stopping
const runningSimulations = new Set<string>();

// Test data for simulating profiler updates
const TEST_ENTITIES = [
  {
    name: "Taylor Swift",
    entity_id: "test_artist_1",
    properties: {
      description: "American singer-songwriter known for narrative songs about her personal life",
      short_description: "Pop superstar and songwriter",
      popularity: "Very High",
      image: { url: "https://example.com/taylor-swift.jpg" }
    },
    tags: [
      { name: "Genre", tag_id: "pop", value: "Pop" },
      { name: "Era", tag_id: "contemporary", value: "Contemporary" }
    ]
  },
  {
    name: "The Great Gatsby",
    entity_id: "test_book_1", 
    properties: {
      description: "F. Scott Fitzgerald's classic novel about the Jazz Age",
      short_description: "Classic American literature",
      popularity: "High",
      image: { url: "https://example.com/gatsby.jpg" }
    },
    tags: [
      { name: "Genre", tag_id: "classic", value: "Classic Literature" },
      { name: "Era", tag_id: "1920s", value: "1920s" }
    ]
  },
  {
    name: "Breaking Bad",
    entity_id: "test_tv_1",
    properties: {
      description: "Crime drama series about a chemistry teacher turned methamphetamine manufacturer",
      short_description: "Award-winning crime drama",
      popularity: "Very High", 
      image: { url: "https://example.com/breaking-bad.jpg" }
    },
    tags: [
      { name: "Genre", tag_id: "drama", value: "Drama" },
      { name: "Theme", tag_id: "crime", value: "Crime" }
    ]
  }
];

const TEST_DOMAIN_ENTITIES = [
  {
    name: "Lorde",
    entity_id: "test_artist_2",
    properties: {
      description: "New Zealand singer-songwriter known for minimalist pop",
      short_description: "Alternative pop artist",
      popularity: "High",
      image: { url: "https://example.com/lorde.jpg" }
    },
    tags: [
      { name: "Genre", tag_id: "alternative", value: "Alternative" },
      { name: "Origin", tag_id: "new_zealand", value: "New Zealand" }
    ]
  },
  {
    name: "1984",
    entity_id: "test_book_2",
    properties: {
      description: "George Orwell's dystopian novel about totalitarianism",
      short_description: "Dystopian classic",
      popularity: "High",
      image: { url: "https://example.com/1984.jpg" }
    },
    tags: [
      { name: "Genre", tag_id: "dystopian", value: "Dystopian" },
      { name: "Theme", tag_id: "political", value: "Political" }
    ]
  }
];

const TEST_CROSS_DOMAIN_ENTITIES = [
  {
    name: "Fleabag",
    entity_id: "test_tv_2",
    properties: {
      description: "British comedy-drama series about a woman navigating life in London",
      short_description: "Award-winning comedy-drama",
      popularity: "High",
      image: { url: "https://example.com/fleabag.jpg" }
    },
    tags: [
      { name: "Genre", tag_id: "comedy", value: "Comedy" },
      { name: "Origin", tag_id: "british", value: "British" }
    ]
  }
];

// Simulate profiler agent updates
export async function simulateProfilerUpdates(userId: string, ws: any) {
  console.log("🧪 Starting simulated profiler updates for user:", userId);
  
  // Add to running simulations
  runningSimulations.add(userId);
  
  // Helper function to send updates
  const sendUpdate = (type: EventType, data: any) => {
    // Check if simulation was stopped
    if (!runningSimulations.has(userId)) {
      console.log("🛑 Simulation stopped for user:", userId);
      return;
    }
    
    const event = {
      id: `test_${Date.now()}_${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
    };
    ws.send(JSON.stringify(event));
  };

  // Step 1: Initial message
  await new Promise(resolve => setTimeout(resolve, 1000));
  sendUpdate("message", {
    message: "I'm analyzing your interests and categorizing them for deeper exploration...",
    reasoning: "Processing your input to understand what types of entities we're working with",
    stage: "entity_resolution"
  });

  // Step 1: Timeline update
  sendUpdate("timeline_update", {
    timeline: [
      { id: "1", text: "Gathering Your Interests", status: "completed", type: "question" },
      { id: "2", text: "Resolving Entities", status: "in_progress", type: "analysis" },
      { id: "3", text: "Expanding Domains", status: "pending", type: "analysis" },
      { id: "4", text: "Cross-Domain Analysis", status: "pending", type: "synthesis" },
      { id: "5", text: "Final Synthesis", status: "pending", type: "synthesis" }
    ],
    currentStage: "Resolving Entities"
  });

  // Step 2: Entity resolution messages
  await new Promise(resolve => setTimeout(resolve, 2000));
  sendUpdate("message", {
    message: "Now I'm resolving your interests to get detailed information about each one...",
    reasoning: "Looking up each entity in our cultural intelligence database",
    stage: "entity_resolution"
  });

  await new Promise(resolve => setTimeout(resolve, 1500));
  sendUpdate("message", {
    message: "Great! I found detailed information for 3 of your interests. Let me show you what I discovered...",
    reasoning: "Successfully resolved entities with cultural intelligence data",
    stage: "entity_resolution"
  });

  // Step 2: Stream resolved entities
  for (let i = 0; i < TEST_ENTITIES.length; i++) {
    await new Promise(resolve => setTimeout(resolve, i === 0 ? 500 : 1000));
    sendUpdate("insight", {
      entity: TEST_ENTITIES[i],
      context: {
        stage: "entity_resolution",
        reasoning: `Found detailed information about ${TEST_ENTITIES[i].name}`,
        domainType: i === 0 ? "artist" : i === 1 ? "book" : "tv_show"
      }
    });
  }

  // Step 2: Timeline update
  sendUpdate("timeline_update", {
    timeline: [
      { id: "1", text: "Gathering Your Interests", status: "completed", type: "question" },
      { id: "2", text: "Resolving Entities", status: "completed", type: "analysis" },
      { id: "3", text: "Expanding Domains", status: "in_progress", type: "analysis" },
      { id: "4", text: "Cross-Domain Analysis", status: "pending", type: "synthesis" },
      { id: "5", text: "Final Synthesis", status: "pending", type: "synthesis" }
    ],
    currentStage: "Expanding Domains"
  });

  // Step 3: Domain expansion
  await new Promise(resolve => setTimeout(resolve, 2000));
  sendUpdate("message", {
    message: "Now I'm exploring what people with similar tastes enjoy in each domain...",
    reasoning: "Using your resolved entities to find related interests and patterns",
    stage: "domain_expansion"
  });

  await new Promise(resolve => setTimeout(resolve, 1500));
  sendUpdate("message", {
    message: "I found 2 related artists that people with your taste enjoy!",
    reasoning: "Expanded artist domain based on your preferences",
    stage: "domain_expansion"
  });

  // Stream domain expansion insights
  for (let i = 0; i < TEST_DOMAIN_ENTITIES.length; i++) {
    await new Promise(resolve => setTimeout(resolve, i === 0 ? 500 : 1000));
    sendUpdate("insight", {
      entity: TEST_DOMAIN_ENTITIES[i],
      context: {
        stage: "domain_expansion",
        reasoning: `People with your taste in ${i === 0 ? "music" : "books"} also enjoy these`,
        domainType: i === 0 ? "artist" : "book"
      }
    });
  }

  // Step 3: Timeline update
  sendUpdate("timeline_update", {
    timeline: [
      { id: "1", text: "Gathering Your Interests", status: "completed", type: "question" },
      { id: "2", text: "Resolving Entities", status: "completed", type: "analysis" },
      { id: "3", text: "Expanding Domains", status: "completed", type: "analysis" },
      { id: "4", text: "Cross-Domain Analysis", status: "in_progress", type: "synthesis" },
      { id: "5", text: "Final Synthesis", status: "pending", type: "synthesis" }
    ],
    currentStage: "Cross-Domain Analysis"
  });

  // Step 4: Cross-domain insights
  await new Promise(resolve => setTimeout(resolve, 2000));
  sendUpdate("message", {
    message: "Now I'm finding interesting connections between different domains of your interests...",
    reasoning: "Analyzing cross-domain patterns to discover deeper insights",
    stage: "cross_domain_insights"
  });

  await new Promise(resolve => setTimeout(resolve, 1500));
  sendUpdate("message", {
    message: "Interesting! I found connections between music and tv_shows...",
    reasoning: "Based on your music preferences, you might enjoy these TV shows",
    stage: "cross_domain_insights"
  });

  // Stream cross-domain insights
  for (let i = 0; i < TEST_CROSS_DOMAIN_ENTITIES.length; i++) {
    await new Promise(resolve => setTimeout(resolve, i === 0 ? 500 : 1000));
    sendUpdate("insight", {
      entity: TEST_CROSS_DOMAIN_ENTITIES[i],
      context: {
        stage: "cross_domain_insights",
        reasoning: "Based on your music preferences, you might enjoy these TV shows",
        domainType: "tv_show"
      }
    });
  }

  // Step 4: Timeline update
  sendUpdate("timeline_update", {
    timeline: [
      { id: "1", text: "Gathering Your Interests", status: "completed", type: "question" },
      { id: "2", text: "Resolving Entities", status: "completed", type: "analysis" },
      { id: "3", text: "Expanding Domains", status: "completed", type: "analysis" },
      { id: "4", text: "Cross-Domain Analysis", status: "completed", type: "synthesis" },
      { id: "5", text: "Final Synthesis", status: "in_progress", type: "synthesis" }
    ],
    currentStage: "Final Synthesis"
  });

  // Step 5: Final synthesis
  await new Promise(resolve => setTimeout(resolve, 2000));
  sendUpdate("message", {
    message: "Perfect! Now I'm synthesizing all these insights into your comprehensive taste profile...",
    reasoning: "Combining all discoveries into a personalized analysis",
    stage: "final_synthesis"
  });

  await new Promise(resolve => setTimeout(resolve, 2000));
  sendUpdate("message", {
    message: "✨ Your taste profile is complete! I've discovered fascinating patterns about your preferences and can now provide you with truly personalized experiences.",
    reasoning: "Successfully created comprehensive taste profile with cross-domain insights",
    stage: "final_synthesis"
  });

  // Final timeline update
  sendUpdate("timeline_update", {
    timeline: [
      { id: "1", text: "Gathering Your Interests", status: "completed", type: "question" },
      { id: "2", text: "Resolving Entities", status: "completed", type: "analysis" },
      { id: "3", text: "Expanding Domains", status: "completed", type: "analysis" },
      { id: "4", text: "Cross-Domain Analysis", status: "completed", type: "synthesis" },
      { id: "5", text: "Final Synthesis", status: "completed", type: "synthesis" }
    ],
    currentStage: "Complete"
  });

  // Final completion message
  await new Promise(resolve => setTimeout(resolve, 2000));
  

  console.log("✅ Simulated profiler updates completed for user:", userId);
  
  // 🔄 Auto-restart for continuous testing (only if not stopped)
  if (runningSimulations.has(userId)) {
    console.log("🔄 Restarting simulation in 3 seconds...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Reset state and restart
    sendUpdate("timeline_update", {
      timeline: [
        { id: "1", text: "Gathering Your Interests", status: "pending", type: "question" },
        { id: "2", text: "Resolving Entities", status: "pending", type: "analysis" },
        { id: "3", text: "Expanding Domains", status: "pending", type: "analysis" },
        { id: "4", text: "Cross-Domain Analysis", status: "pending", type: "synthesis" },
        { id: "5", text: "Final Synthesis", status: "pending", type: "synthesis" }
      ],
      currentStage: "Initializing..."
    });
    
    // Restart the simulation
    simulateProfilerUpdates(userId, ws);
  } else {
    console.log("🛑 Simulation stopped, not restarting");
  }
}

// Stop the simulation for a user
export function stopProfilerSimulation(userId: string) {
  runningSimulations.delete(userId);
  console.log("🛑 Stopped simulation for user:", userId);
} 