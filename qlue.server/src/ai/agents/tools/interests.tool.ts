import { tool } from "ai";
import { z } from "zod";
import { prisma } from "../../../db/db";
import { orchestrator } from "../../orchestrator";

export type UserInterests = {
  name: string;
  age: number;
  gender: string;
  location: string;
  artists: string[];
  podcasts: string[];
  booksShowsMovies: string[];
  hobbiesOther: string[];
};

export const saveUserInterests = tool({
  description:
    "Save user's interests and basic info to create their taste profile",
  parameters: z.object({
    name: z.string().describe("The user's name"),
    age: z.number().describe("The user's age"),
    gender: z.string().describe("The user's gender/sex"),
    location: z.string().describe("The user's city location"),
    artists: z
      .array(z.string())
      .describe("Array of artists they're listening to or love"),
    podcasts: z
      .array(z.string())
      .describe("Array of podcasts they'd recommend or are obsessed with"),
    booksShowsMovies: z
      .array(z.string())
      .describe("Array of books, shows, or movies they're into lately"),
    hobbiesOther: z
      .array(z.string())
      .describe(
        "Array of other interests, hobbies, or things they're passionate about"
      ),
  }),
  execute: async (
    {
      name,
      age,
      gender,
      location,
      artists,
      podcasts,
      booksShowsMovies,
      hobbiesOther,
    },
    { toolCallId, messages, abortSignal, ...options }
  ) => {
    try {
      // Get userId from the execution context (passed via options)
      const userId = (options as any).userId;

      if (!userId) {
        throw new Error("User ID not found in execution context");
      }

      const interests: UserInterests = {
        name,
        age,
        gender,
        location,
        artists,
        podcasts,
        booksShowsMovies,
        hobbiesOther,
      };

      await prisma.user.update({
        where: { id: userId },
        data: {
          age,
          interests: JSON.stringify(interests),
          onboarding: "COMPLETE",
        },
      });

      // Trigger agent processing (non-blocking)
      orchestrator.startAgentProcessing(userId, interests).catch((error) => {
        console.error("Failed to start agent processing:", error);
      });

      return {
        success: true,
        message:
          "Interests saved successfully! I'm now analyzing your taste profile - you'll be redirected shortly to see my progress.",
      };
    } catch (error) {
      console.error("Error saving user interests:", error);
      return {
        success: false,
        message:
          "Sorry, there was an error saving your interests. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const tools = {
  saveUserInterests: saveUserInterests,
};
