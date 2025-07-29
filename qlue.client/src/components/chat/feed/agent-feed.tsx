import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Button,
} from "@heroui/react";
import { CircleCheck, Icon, Play, Square } from "lucide-react";
import { useState, useEffect } from "react";
import type { TimelineItem } from "./research";
import VerticalTimeline from "./vertical-timeline";
import Logo from "../../logo";
import { useSSE } from "../../../hooks/useSSE";
import EntityUpdate from "./entity-update";
import { MessageUpdate } from "./message-update";
import { Thinking } from "../thinking";

interface AgentFeedProps {
  agentName: string;
  agentAvatar: string;
  currentStage: string;
  timeline: TimelineItem[];
  insights: string[];
}

interface SSEFeedData {
  timeline: TimelineItem[];
  insights: string[];
  currentStage: string;
}

export default function AgentFeed({ props }: { props: AgentFeedProps }) {
  const {
    agentAvatar,
    agentName,
    currentStage: initialStage,
    timeline: initialTimeline,
    insights: initialInsights,
  } = props;

  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStage, setCurrentStage] = useState(initialStage);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [insights, setInsights] = useState(initialInsights);

  return (
    <main>
      <Card
        shadow="none"
        className="w-full h-[520px] border-1 rounded-3xl border-zinc-200"
      >
        <CardBody className="p-6 relative">
          <div className="flex relative">
            <div className="w-1/4 pr-4">
              <VerticalTimeline items={timeline} className="mb-4" />
            </div>

            {/* Vertical divider - extends beyond CardBody padding */}
            <div
              className="absolute left-1/4 top-0 bottom-0 w-[0.1px] bg-stone-200 transform -translate-x-1/2 h-[518px]"
              style={{ top: "-24px", bottom: "-24px" }}
            />

            <div className="w-3/4 pl-4">
              <ul className="space-y-7">
                <MessageUpdate query="Whitney Houston" />
                {insights.map((insight, index) => (
                  <EntityUpdate key={index} />
                ))}
                <Thinking />
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
