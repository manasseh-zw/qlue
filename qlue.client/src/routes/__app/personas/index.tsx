import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@heroui/react";
import { Play } from "lucide-react";
import { useState, useRef } from "react";

export const Route = createFileRoute("/__app/personas/")({
  component: RouteComponent,
});

function RouteComponent() {
  const personas = [
    {
      id: 1,
      title: "Healthcare Assistant",
      description:
        "Guide patient intake, analyze symptoms, and provide real-time medical documentation support.",
      video: "demo/demo1.mp4#t=12",
      tag: "HEALTHCARE",
    },
    {
      id: 2,
      title: "Creative Director",
      description:
        "Brainstorm ideas, refine concepts, and bring your creative vision to life with expert guidance.",
      video: "demo/demo2.mp4#t=8",
      tag: "CREATIVE",
    },
    {
      id: 3,
      title: "Business Strategist",
      description:
        "Develop growth strategies, analyze market trends, and optimize your business operations.",
      video: "demo/demo3.mp4#t=3",
      tag: "BUSINESS",
    },
  ];

  // @ts-ignore
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleMouseEnter = (index: number) => {
    setHoveredCard(index);
    const video = videoRefs.current[index];
    if (video) {
      video.currentTime = 0;
      video.play();
    }
  };

  const handleMouseLeave = (index: number) => {
    setHoveredCard(null);
    const video = videoRefs.current[index];
    if (video) {
      video.pause();
    }
  };

  return (
    <div className="h-full ">
      <div className="h-full">
        {/* Personas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1.7px] h-full">
          {personas.map((persona, index) => (
            <div
              key={persona.id}
              className="group relative"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave(index)}
            >
              {/* Video Card */}
              <div className="relative w-full h-full overflow-hidden shadow-lg">
                {/* Video Background */}
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={persona.video}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  {/* Top Section */}
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-black/30 backdrop-blur-sm rounded-md text-xs font-medium text-white border border-white/20">
                      {persona.tag}
                    </span>
                  </div>

                  {/* Bottom Section */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {persona.title}
                      </h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        {persona.description}
                      </p>
                    </div>

                    {/* Start Conversation Button */}
                    <Button
                      className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-300 group-hover:scale-105"
                      size="lg"
                      radius="md"
                      startContent={<Play className="w-4 h-4" />}
                    >
                      Start Conversation
                    </Button>
                  </div>
                </div>

                {/* Subtle Ring */}
                <div className="pointer-events-none absolute inset-0 ring-1 ring-white/20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
