import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Image,
  Tabs,
  Tab,
  Progress,
  Avatar,
} from "@heroui/react";

// Sample data structure matching TasteProfileResult
const sampleProfileData = {
  primaryEntities: [
    {
      name: "Whitney Houston",
      entity_id: "BDA775C1-554E-4EA9-B371-5D5DFD5EE6DE",
      properties: {
        description:
          "Whitney Houston was an American singer and actress known for her powerful voice and emotive ballads.",
        short_description: "American singer and actress",
        popularity: "0.998",
        image: {
          url: "https://images.qloo.com/i/BDA775C1-554E-4EA9-B371-5D5DFD5EE6DE-420x-auto.jpg",
        },
      },
      tags: [
        {
          name: "Soul",
          tag_id: "urn:tag:genre:soul",
          value: "urn:tag:genre:soul",
        },
        {
          name: "80s",
          tag_id: "urn:tag:genre:80s",
          value: "urn:tag:genre:80s",
        },
        {
          name: "Rhythm & Blues",
          tag_id: "urn:tag:genre:rhythm_blues",
          value: "urn:tag:genre:rhythm_blues",
        },
      ],
    },
    {
      name: "Michael Jackson",
      entity_id: "F543075C-57C4-4AB9-B3B7-04A3D6C7C30A",
      properties: {
        description:
          "Michael Jackson was an American singer, songwriter, and dancer, known as the King of Pop.",
        short_description: "American singer and dancer",
        popularity: "0.999",
        image: {
          url: "https://images.qloo.com/i/F543075C-57C4-4AB9-B3B7-04A3D6C7C30A-420x-auto.jpg",
        },
      },
      tags: [
        {
          name: "Soul",
          tag_id: "urn:tag:genre:soul",
          value: "urn:tag:genre:soul",
        },
        {
          name: "Dance",
          tag_id: "urn:tag:genre:dance",
          value: "urn:tag:genre:dance",
        },
        {
          name: "Funk",
          tag_id: "urn:tag:genre:funk",
          value: "urn:tag:genre:funk",
        },
      ],
    },
    {
      name: "Jurassic Park",
      entity_id: "D3529AD8-9349-481E-8FCB-D107EFB75E68",
      properties: {
        description:
          "A theme park of cloned dinosaurs suffers a major power breakdown, leading to chaos and survival struggles.",
        short_description: "1993 sci-fi adventure film",
        popularity: "0.998",
        image: {
          url: "https://images.qloo.com/i/D3529AD8-9349-481E-8FCB-D107EFB75E68-420x-auto.jpg",
        },
      },
      tags: [
        {
          name: "Sci-Fi",
          tag_id: "urn:tag:genre:sci_fi",
          value: "urn:tag:genre:sci_fi",
        },
        {
          name: "Adventure",
          tag_id: "urn:tag:genre:adventure",
          value: "urn:tag:genre:adventure",
        },
        {
          name: "Thriller",
          tag_id: "urn:tag:genre:thriller",
          value: "urn:tag:genre:thriller",
        },
      ],
    },
  ],
  domainExpansions: {
    artist: [
      {
        name: "Destiny's Child",
        entity_id: "2B70365D-998E-4053-83BB-344A16011345",
        properties: {
          description:
            "An American female R&B vocal group known for their powerful harmonies and influential hits.",
          short_description: "American R&B vocal group",
          popularity: "0.998",
          image: {
            url: "https://images.qloo.com/i/2B70365D-998E-4053-83BB-344A16011345-420x-auto.jpg",
          },
        },
        tags: [
          { name: "Rhythm & Blues", tag_id: "", value: "" },
          { name: "Soul", tag_id: "", value: "" },
          { name: "Hip-Hop", tag_id: "", value: "" },
        ],
      },
      {
        name: "Mariah Carey",
        entity_id: "CDB8A65C-3BF0-47BF-A336-2CFC70417D7F",
        properties: {
          description:
            "Mariah Carey is an American singer, songwriter, and record producer known for her five-octave vocal range.",
          short_description: "American singer and songwriter",
          popularity: "0.999",
          image: {
            url: "https://images.qloo.com/i/CDB8A65C-3BF0-47BF-A336-2CFC70417D7F-420x-auto.jpg",
          },
        },
        tags: [
          { name: "Soul", tag_id: "", value: "" },
          { name: "Rhythm & Blues", tag_id: "", value: "" },
        ],
      },
    ],
    movie: [
      {
        name: "Star Wars: Episode V - The Empire Strikes Back",
        entity_id: "34F365F2-ED0D-4612-A39D-AA5D98D2B7A3",
        properties: {
          description:
            "After the Empire overpowers the Rebel Alliance, Luke Skywalker begins training with Jedi Master Yoda.",
          short_description: "1980 American epic space opera film",
          popularity: "0.999",
          image: {
            url: "https://images.qloo.com/i/34F365F2-ED0D-4612-A39D-AA5D98D2B7A3-420x-auto.jpg",
          },
        },
        tags: [
          { name: "Sci-Fi", tag_id: "", value: "" },
          { name: "Adventure", tag_id: "", value: "" },
          { name: "Fantasy", tag_id: "", value: "" },
        ],
      },
    ],
  },
  crossDomainInsights: [
    {
      pairing: {
        sourceDomain: "artist",
        targetDomain: "brand",
        reasoning:
          "Music tastes, such as those for Whitney Houston and Michael Jackson, are often aligned with lifestyle and brand preferences.",
        sourceEntities: [
          {
            id: "BDA775C1-554E-4EA9-B371-5D5DFD5EE6DE",
            name: "Whitney Houston",
          },
          {
            id: "F543075C-57C4-4AB9-B3B7-04A3D6C7C30A",
            name: "Michael Jackson",
          },
        ],
      },
      result: {
        insights: {
          brand: {
            entities: [
              {
                name: "Calvin Klein",
                entity_id: "3EC9E7DF-1497-44C4-8642-E7FA2FF3A99D",
                properties: {
                  description: "American fashion house",
                  short_description: "American fashion house",
                  popularity: "0.999",
                  image: {
                    url: "https://images.qloo.com/i/3EC9E7DF-1497-44C4-8642-E7FA2FF3A99D-420x-auto.jpg",
                  },
                },
                tags: [
                  { name: "Casual", tag_id: "", value: "" },
                  { name: "1990s fashion", tag_id: "", value: "" },
                ],
              },
            ],
            total: 1,
          },
        },
      },
    },
  ],
  finalAnalysis:
    "## Manasseh's Comprehensive Taste Profile\n\n### Executive Summary\n\n**Key Personality Insights:**\n- **Curious, Ambitious, and Culturally Open:** Manasseh's interests span classic pop/soul music, epic fantasy, science fiction, entrepreneurship, and creative pursuits.\n- **Entrepreneurial and Analytical:** Strong engagement with business/entrepreneurship podcasts and programming as a hobby signals a growth mindset.\n- **Creative and Expressive:** Interest in art and iconic performers points to a strong appreciation for creativity and emotional expression.\n\n**Primary Taste Patterns:**\n- **Classic Meets Contemporary:** Enjoys timeless music icons and modern business thought leadership.\n- **Epic Storytelling:** Drawn to grand narratives, whether in fantasy TV, blockbuster movies, or superhero tales.\n- **Learning and Growth:** Seeks out content that offers practical knowledge, inspiration, and frameworks for personal and professional development.",
};

export const Route = createFileRoute("/__app/me/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selected, setSelected] = useState("profile");

  const EntityCard = ({ entity }: { entity: any; type?: string }) => (
    <Card className="w-full max-w-[200px] hover:scale-105 transition-transform duration-200 cursor-pointer">
      <CardBody className="p-0">
        <Image
          alt={entity.name}
          className="w-full h-[200px] object-cover"
          src={entity.properties.image.url}
          fallbackSrc="https://via.placeholder.com/200x200?text=No+Image"
        />
        <div className="p-3">
          <h4 className="font-semibold text-sm truncate">{entity.name}</h4>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {entity.properties.short_description}
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

  const DomainSection = ({
    title,
    entities,
    subtitle,
  }: {
    title: string;
    entities: any[];
    subtitle?: string;
  }) => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <Chip variant="flat" color="primary" size="sm">
          Show all
        </Chip>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {entities.map((entity, index) => (
          <EntityCard key={index} entity={entity} />
        ))}
      </div>
    </div>
  );

  const CrossDomainInsight = ({ insight }: { insight: any }) => (
    <Card className="mb-6">
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
            <h4 className="font-semibold">
              {insight.pairing.sourceDomain} → {insight.pairing.targetDomain}
            </h4>
            <p className="text-sm text-gray-600">{insight.pairing.reasoning}</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="flex gap-3 overflow-x-auto">
          {insight.result.insights[insight.pairing.targetDomain]?.entities.map(
            (entity: any, index: number) => (
              <EntityCard key={index} entity={entity} />
            )
          )}
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Avatar
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-bold">Manasseh</h1>
            <p className="text-gray-600">Your personalized taste profile</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
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
      <div className="px-6 py-6">
        {selected === "profile" ? (
          <div className="space-y-8">
            {/* Primary Entities */}
            <DomainSection
              title="Your Top Interests"
              subtitle="Based on your taste profile"
              entities={sampleProfileData.primaryEntities}
            />

            {/* Domain Expansions */}
            {Object.entries(sampleProfileData.domainExpansions).map(
              ([domain, entities]) => (
                <DomainSection
                  key={domain}
                  title={`More ${domain} you might like`}
                  subtitle={`Based on your ${domain} preferences`}
                  entities={entities}
                />
              )
            )}

            {/* Cross-Domain Insights */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">
                Cross-Domain Discoveries
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Interesting connections between your different interests
              </p>
              {sampleProfileData.crossDomainInsights.map((insight, index) => (
                <CrossDomainInsight key={index} insight={insight} />
              ))}
            </div>

            {/* Final Analysis */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold">
                  Your Taste Profile Summary
                </h3>
              </CardHeader>
              <CardBody>
                <div className="prose prose-sm max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sampleProfileData.finalAnalysis.replace(
                        /\n/g,
                        "<br/>"
                      ),
                    }}
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold">Profile Statistics</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {sampleProfileData.primaryEntities.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Primary Interests
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {Object.keys(sampleProfileData.domainExpansions).length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Domains Explored
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {sampleProfileData.crossDomainInsights.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Cross-Domain Insights
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold">Domain Breakdown</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {Object.entries(sampleProfileData.domainExpansions).map(
                    ([domain, entities]) => (
                      <div key={domain}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="capitalize font-medium">
                            {domain}
                          </span>
                          <span className="text-sm text-gray-600">
                            {entities.length} items
                          </span>
                        </div>
                        <Progress
                          value={(entities.length / 10) * 100}
                          className="w-full"
                          color="primary"
                          size="sm"
                        />
                      </div>
                    )
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
