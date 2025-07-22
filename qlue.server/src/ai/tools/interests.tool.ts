import { tool } from "ai";
import { z } from "zod";
import { prisma } from "../../db";

export interface UserInterests {
  name: string;
  age: number;
  gender: string;
  music: string[];
  podcasts: string[];
  booksShowsMovies: string[];
  hobbiesOther: string[];
}

export const saveUserInterestsTool = tool({
  description: "Save user's interests and basic info to create their taste profile",
  parameters: z.object({
    name: z.string().describe("The user's name"),
    age: z.number().describe("The user's age"),
    gender: z.string().describe("The user's gender/sex"),
    music: z.array(z.string()).describe("Array of music they're listening to or love"),
    podcasts: z.array(z.string()).describe("Array of podcasts they'd recommend or are obsessed with"),
    booksShowsMovies: z.array(z.string()).describe("Array of books, shows, or movies they're into lately"),
    hobbiesOther: z.array(z.string()).describe("Array of other interests, hobbies, or things they're passionate about"),
  }),
  execute: async ({ name, age, gender, music, podcasts, booksShowsMovies, hobbiesOther }, { toolCallId, messages, abortSignal, ...options }) => {
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
        music,
        podcasts,
        booksShowsMovies,
        hobbiesOther,
      };

      // Update user with interests, age, and complete onboarding
      await prisma.user.update({
        where: { id: userId },
        data: {
          age,
          interests: interests as unknown as any,
          onboarding: "COMPLETE",
        },
      });

      return {
        success: true,
        message: "Your taste profile has been created successfully! Redirecting you to your personalized taste profile...",
        redirectTo: "/taste-profile",
      };
    } catch (error) {
      console.error("Error saving user interests:", error);
      return {
        success: false,
        message: "Sorry, there was an error saving your interests. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const tools = {
  saveUserInterests: saveUserInterestsTool,
}; 