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
  const { agentAvatar, agentName, currentStage: initialStage, timeline: initialTimeline, insights: initialInsights } = props;
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStage, setCurrentStage] = useState(initialStage);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [insights, setInsights] = useState(initialInsights);
  
  const { data, isConnected, error } = useSSE<SSEFeedData>(
    'http://localhost:8080/api/taste/feed',
    {
      enabled: isStreaming,
      onMessage: (data) => {
        setCurrentStage(data.currentStage);
        setTimeline(data.timeline);
        setInsights(data.insights);
      },
      onOpen: () => {
        console.log('SSE connection opened');
      },
      onError: (error) => {
        console.error('SSE error:', error);
        setIsStreaming(false);
      }
    }
  );
  
  const startStreaming = () => {
    setIsStreaming(true);
  };
  
  const stopStreaming = () => {
    setIsStreaming(false);
  };
  
  const resetToInitial = () => {
    setCurrentStage(initialStage);
    setTimeline(initialTimeline);
    setInsights(initialInsights);
    setIsStreaming(false);
  };
  return (
    <main>
      <Card
        shadow="none"
        className="w-full min-h-[480px] border-1 rounded-3xl border-zinc-300"
      >
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Avatar icon={<Logo></Logo>} size="sm" />
            <div>
              <p className="text-small text-default-500">Agent</p>
              {isConnected && (
                <p className="text-xs text-success">● Live</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip color="primary" variant="flat">
              {currentStage}
            </Chip>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                isIconOnly
                onClick={startStreaming}
                isDisabled={isStreaming}
              >
                <Play className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="danger"
                isIconOnly
                onClick={stopStreaming}
                isDisabled={!isStreaming}
              >
                <Square className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="flat"
                onClick={resetToInitial}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <div className="flex">
            <div className="w-1/4 pr-4">
              <VerticalTimeline items={timeline} className="mb-4" />
            </div>

            <div className="w-3/4 pl-4">
              <h4 className="text-medium font-semibold mb-2">Insights</h4>
              <ul className="space-y-2">
                {insights.map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <CircleCheck className="w-5 h-5 text-success mr-2 mt-0.5" />
                    <span className="text-small">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
