import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Image,
  Tabs,
  Tab,
  Avatar,
  Button,
  Spinner,
} from "@heroui/react";
import { getTasteProfile } from "@/lib/services/ai.service";
import { Markdown } from "@/components/chat/markdown";
import { User, Music, Film, Heart, TrendingUp, Users } from "lucide-react";

interface TasteProfileResult {
  primaryEntities: any[];
  domainExpansions: Record<string, any[]>;
  crossDomainInsights: any[];
  finalAnalysis: string;
}

export const Route = createFileRoute("/__app/me/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selected, setSelected] = useState("profile");
  const [profileData, setProfileData] = useState<TasteProfileResult | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getTasteProfile();
        setProfileData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const EntityCard = ({ entity }: { entity: any; type?: string }) => {
    // Debug logging console.log("Entity data:", entity);
    // Add null checks and fallbacks
    if (!entity || !entity.properties) {
      console.warn("Invalid entity structure:", entity);
      return (
        <Card className="w-full min-w-[180px] max-w-[220px] border border-gray-100">
          <CardBody className="p-3">
            <h4 className="font-medium text-sm truncate">Invalid Entity</h4>
            <p className="text-xs text-gray-500 mt-1">Data structure error</p>
          </CardBody>
        </Card>
      );
    }
    return (
      <Card className="w-full min-w-[180px] max-w-[220px] hover:scale-105 transition-transform duration-200 cursor-pointer border border-gray-100">
        <CardBody className="p-0">
          <Image
            alt={entity.name || "Unknown"}
            // The class below is the only change needed
            className="w-full h-full object-cover"
            src={
              entity.properties.image?.url ||
              "https://via.placeholder.com/200x200?text=No+Image"
            }
            fallbackSrc="https://via.placeholder.com/200x200?text=No+Image"
          />
          <div className="p-3">
            <h4 className="font-medium text-sm truncate">
              {entity.name || "Unknown"}
            </h4>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {entity.properties.short_description ||
                "No description available"}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {entity.tags?.slice(0, 2).map((tag: any, index: number) => (
                <Chip key={index} size="sm" variant="flat" className="text-xs">
                  {tag.name}
                </Chip>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your taste profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            {Object.entries(profileData.domainExpansions).map(
              ([domain, entities]) => (
                <DomainSection
                  key={domain}
                  title={`More ${domain} you might like`}
                  subtitle={`Based on your ${domain} preferences`}
                  entities={entities}
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
            {profileData.crossDomainInsights.length > 0 && (
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
                {profileData.crossDomainInsights.map((insight, index) => (
                  <CrossDomainInsight key={index} insight={insight} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Final Analysis */}
            <Card className="border border-gray-100">
              <CardBody className="p-10">
                <div className="prose prose-sm max-w-none">
                  <Markdown>{profileData.finalAnalysis}</Markdown>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
