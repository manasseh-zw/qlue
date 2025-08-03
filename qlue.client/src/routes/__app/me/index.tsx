import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardBody, CardHeader, Tabs, Tab, Avatar } from "@heroui/react";
import { Music, Film, TrendingUp, Users } from "lucide-react";
import { EntityCard } from "../../../components/persona/entity-card";
import { authState, authActions } from "../../../lib/state/auth.state";
import Markdown from "react-markdown";
import { getTasteProfile } from "../../../lib/services/ai.service";

interface TasteProfileResult {
  primaryEntities: any[];
  domainExpansions: Record<string, any[]>;
  crossDomainInsights: any[];
  finalAnalysis: string;
}

export const Route = createFileRoute("/__app/me/")({
  component: RouteComponent,
  loader: async () => {
    // Check if we have cached taste profile in auth state
    const currentState = authState.state;

    if (currentState.tasteProfile) {
      // Return cached data
      return { tasteProfile: currentState.tasteProfile };
    }

    // If not cached, fetch from API
    try {
      authActions.setTasteProfileLoading(true);
      const data = await getTasteProfile();
      authActions.setTasteProfile(data);
      return { tasteProfile: data };
    } catch (error) {
      authActions.setTasteProfileLoading(false);
      throw new Error(
        error instanceof Error ? error.message : "Failed to load profile"
      );
    }
  },
});

function RouteComponent() {
  const [selected, setSelected] = useState("profile");
  const { tasteProfile } = Route.useLoaderData();

  const DomainSection = ({
    title,
    entities,
    subtitle,
    icon: Icon,
  }: {
    title: string;
    entities: any[];
    subtitle?: string;
    icon?: any;
  }) => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-gray-600" />}
          <div>
            <h3 className="text-xl font-medium">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {entities.map((entity, index) => (
          <EntityCard key={index} entity={entity} />
        ))}
      </div>
    </div>
  );

  const CrossDomainInsight = ({ insight }: { insight: any }) => (
    <Card shadow="sm" className="mb-6 border border-gray-100">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar
            src={
              insight.result.insights[insight.pairing.targetDomain]?.entities[0]
                ?.properties.image.url
            }
            size="sm"
          />
          <div>
            <h4 className="font-medium">
              {insight.pairing.sourceDomain} → {insight.pairing.targetDomain}
            </h4>
            <p className="text-sm text-gray-500">{insight.pairing.reasoning}</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {insight.result.insights[insight.pairing.targetDomain]?.entities.map(
            (entity: any, index: number) => (
              <EntityCard key={index} entity={entity} />
            )
          )}
        </div>
      </CardBody>
    </Card>
  );

  if (!tasteProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Tabs */}
      <div className="bg-white pt-6 sm:px-6">
        <Tabs
          selectedKey={selected}
          variant="solid"
          onSelectionChange={(key) => setSelected(key as string)}
        >
          <Tab key="profile" title="Profile" />
          <Tab key="analysis" title="Analysis" />
        </Tabs>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6">
        {selected === "profile" ? (
          <div className="space-y-8">
            {/* Domain Expansions */}
            {Object.entries(tasteProfile.domainExpansions).map(
              ([domain, entities]) => (
                <DomainSection
                  key={domain}
                  title={`More ${domain} you might like`}
                  subtitle={`Based on your ${domain} preferences`}
                  entities={entities as any[]}
                  icon={
                    domain === "artist"
                      ? Music
                      : domain === "movie"
                        ? Film
                        : Users
                  }
                />
              )
            )}

            {/* Cross-Domain Insights */}
            {tasteProfile.crossDomainInsights.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <h3 className="text-xl font-medium">
                    Cross-Domain Discoveries
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Interesting connections between your different interests
                </p>
                {tasteProfile.crossDomainInsights.map(
                  (insight: any, index: number) => (
                    <CrossDomainInsight key={index} insight={insight} />
                  )
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Final Analysis */}
            <Card className="border border-gray-100">
              <CardBody className="p-10">
                <div className="prose prose-sm max-w-none">
                  <Markdown>{tasteProfile.finalAnalysis}</Markdown>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
