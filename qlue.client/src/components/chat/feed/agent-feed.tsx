import { Card, CardBody, Button } from "@heroui/react";
import { useState, useEffect, useRef } from "react";
import Timeline from "./timeline";
import EntityUpdate from "./entity-update";
import { MessageUpdate } from "./message-update";
import { Thinking } from "../thinking";
import type {
  AgentFeedProps,
  InsightData,
  MessageData,
  TimelineItem,
} from "./types";
import Logo from "../../logo";

export default function AgentFeed({
  currentStage,
  timeline: initialTimeline,
  feedItems: initialFeedItems = [],
  onContinue,
}: AgentFeedProps & { onContinue?: () => void }) {
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);
  const [feedItems, setFeedItems] = useState(initialFeedItems);
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Update feed items when props change
  useEffect(() => {
    setFeedItems(initialFeedItems);
  }, [initialFeedItems]);

  // Update state when props change
  useEffect(() => {
    setTimeline(initialTimeline);
  }, [initialTimeline]);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (feedEndRef.current) {
      feedEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [feedItems.length]);

  // Check if profiler is complete (all timeline items are completed)
  const isComplete = timeline.every((item) => item.status === "completed");

  return (
    <main>
      <Card
        shadow="none"
        className="w-[1000px] h-[650px] border-1 rounded-3xl border-zinc-200"
      >
        <CardBody className="p-6 relative">
          <div className="flex relative">
            <div className="w-1/4 pr-4">
              <Timeline items={timeline} className="mb-4" />
            </div>

            {/* Vertical divider - extends beyond CardBody padding */}
            <div
              className="absolute left-1/4 top-0 bottom-0 w-[0.1px] bg-stone-200 transform -translate-x-1/2 h-[648px]"
              style={{ top: "-24px", bottom: "-24px" }}
            />

            <div className="w-3/4 pl-4">
              <div className="h-[580px] overflow-y-auto scrollbar-hide">
                <ul className="space-y-7">
                  {feedItems.length === 0 ? (
                    <li className="flex items-start gap-2 min-w-0">
                      <div className="flex flex-col flex-1 min-w-0">
                        <Thinking />
                      </div>
                    </li>
                  ) : (
                    feedItems.map((item, index) => (
                      <li key={item.id} className="min-w-0 ml-2">
                        {item.type === "message" ? (
                          <MessageUpdate
                            message={(item.data as MessageData).message}
                            reasoning={(item.data as MessageData).reasoning}
                            stage={(item.data as MessageData).stage}
                          />
                        ) : (
                          <div className="relative">
                            <div className="pl-8">
                              <EntityUpdate
                                entity={(item.data as InsightData).entity}
                                context={(item.data as InsightData).context}
                              />
                            </div>
                          </div>
                        )}
                      </li>
                    ))
                  )}

                  {/* Show thinking indicator if processing */}
                  {feedItems.length > 0 && currentStage.includes("...") && (
                    <li className="flex items-start gap-2 min-w-0">
                      <div className="flex flex-col flex-1 min-w-0">
                        <Thinking />
                      </div>
                    </li>
                  )}
                </ul>
                {/* Invisible element to scroll to */}
                <div ref={feedEndRef} />
              </div>
            </div>
          </div>

          {/* Continue button - appears when profiler is complete */}
          {isComplete && onContinue && (
            <div className="absolute bottom-4 right-4">
              <Button

                color="primary"
                variant="ghost"
                size="md"
                onPress={onContinue}
                radius="full"
                className="border-[1.3px] bg-white"
              >Continue

              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </main>
  );
}
