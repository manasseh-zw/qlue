import { Card, CardBody } from "@heroui/react";
import { useState, useEffect } from "react";
import Timeline, { type TimelineItem } from "./timeline";
import EntityUpdate from "./entity-update";
import { MessageUpdate } from "./message-update";
import { Thinking } from "../thinking";

interface EntityData {
  name: string;
  entity_id: string;
  properties: {
    description: string;
    short_description: string;
    popularity: string;
    image: {
      url: string;
    };
  };
  tags?: Array<{
    name: string;
    tag_id: string;
    value: string;
  }>;
}

interface InsightData {
  entity: EntityData;
  context: {
    stage: string;
    reasoning: string;
    domainType?: string;
  };
}

interface MessageData {
  message: string;
  reasoning?: string;
  stage: string;
}

interface AgentFeedProps {
  currentStage: string;
  timeline: TimelineItem[];
  insights: InsightData[];
  messages: MessageData[];
}

export default function AgentFeed({
  currentStage,
  timeline: initialTimeline,
  insights: initialInsights = [],
  messages: initialMessages = [],
}: AgentFeedProps) {
  const [timeline, setTimeline] = useState(initialTimeline);
  const [insights, setInsights] = useState<InsightData[]>(initialInsights);
  const [messages, setMessages] = useState<MessageData[]>(initialMessages);

  // Update state when props change
  useEffect(() => {
    setTimeline(initialTimeline);
  }, [initialTimeline]);

  useEffect(() => {
    setInsights(initialInsights);
  }, [initialInsights]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Combine and sort messages and insights by timestamp (using array index as proxy)
  const feedItems = [
    ...messages.map((msg, index) => ({
      type: "message" as const,
      data: msg,
      index,
    })),
    ...insights.map((insight, index) => ({
      type: "insight" as const,
      data: insight,
      index,
    })),
  ].sort((a, b) => a.index - b.index);

  return (
    <main>
      <Card
        shadow="none"
        className="w-full h-[520px] border-1 rounded-3xl border-zinc-200"
      >
        <CardBody className="p-6 relative">
          <div className="flex relative">
            <div className="w-1/4 pr-4">
              <Timeline items={timeline} className="mb-4" />
            </div>

            {/* Vertical divider - extends beyond CardBody padding */}
            <div
              className="absolute left-1/4 top-0 bottom-0 w-[0.1px] bg-stone-200 transform -translate-x-1/2 h-[518px]"
              style={{ top: "-24px", bottom: "-24px" }}
            />

            <div className="w-3/4 pl-4">
              <div className="h-[450px] overflow-y-auto scrollbar-hide">
                <ul className="space-y-7">
                  {feedItems.length === 0 ? (
                    <li>
                      <Thinking />
                    </li>
                  ) : (
                    feedItems.map((item, index) => (
                      <li key={`${item.type}-${index}`}>
                        {item.type === "message" ? (
                          <MessageUpdate
                            message={item.data.message}
                            reasoning={item.data.reasoning}
                            stage={item.data.stage}
                          />
                        ) : (
                          <EntityUpdate
                            entity={item.data.entity}
                            context={item.data.context}
                          />
                        )}
                      </li>
                    ))
                  )}

                  {/* Show thinking indicator if processing */}
                  {feedItems.length > 0 && currentStage.includes("...") && (
                    <li>
                      <Thinking />
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
