import { prisma } from "../db/db";
import { TasteProfileResult } from "../ai/agents/profiler.agent";

export class TasteProfileService {
  async getUserTasteProfile(
    userId: string
  ): Promise<TasteProfileResult | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          tasteProfile: true,
        },
      });

      if (!user?.tasteProfile) {
        console.log(`No taste profile found for user ${userId}`);
        return null;
      }

      // Parse the JSON string from the database
      let tasteProfileData: any;
      if (typeof user.tasteProfile.data === "string") {
        tasteProfileData = JSON.parse(user.tasteProfile.data);
      } else {
        tasteProfileData = user.tasteProfile.data;
      }

      const tasteProfileResult: TasteProfileResult = {
        primaryEntities: tasteProfileData.primaryEntities || [],
        domainExpansions: tasteProfileData.domainExpansions || {},
        crossDomainInsights: tasteProfileData.crossDomainInsights || [],
        finalAnalysis: tasteProfileData.finalAnalysis || "",
      };

      return tasteProfileResult;
    } catch (error) {
      console.error("Failed to retrieve taste profile:", error);
      throw new Error(
        `Failed to retrieve taste profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
