import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { StartConversation } from "../../../components/persona/conversation";
import { config } from "../../../../client.config";
import { Chip } from "@heroui/react";

export const Route = createFileRoute("/__app/personas/")({
  component: RouteComponent,
});

function RouteComponent() {
  const personas = [
    {
      id: 1,
      title: "Perfect Pitch",
      description:
        "Charlie analyzes your taste profile to craft personalized sales pitches that resonate with your unique preferences and lifestyle.",
      video: `${config.cdn}/preview-pitch.mp4#t=5`,
      tag: "SALES",
      personaId: "p4fcc991a271",
      replicaId: "rb17cf590e15",
      mode: "perfect_pitch" as const,
    },
    {
      id: 2,
      title: "Perfect Date",
      description:
        "Reeva is a warm, flirty, and witty AI companion designed to simulate an engaging date. She builds connection through playful banter.",
      video: `${config.cdn}/preview-date.mp4#t=8`,
      tag: "DATING",
      personaId: "p993c6e0119c",
      replicaId: "r9d30b0e55ac",
      mode: "adaptive_conversation" as const,
    },
    {
      id: 3,
      title: "Roast Me",
      description:
        "Jack is a brutally honest, sarcastic best friend who uses sharp humor and casual AAVE slang to mercilessly roast your taste in media.",
      video: `${config.cdn}/preview-roast.mp4#t=3`,
      tag: "COMEDY",
      personaId: "p68091165734",
      replicaId: "r93183fb36c0",
      mode: "taste_critic" as const,
    },
  ];

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
                    <Chip
                      variant="dot"
                      color="success"
                      className="text-white items-center gap-1 border-[1px]"
                    >
                      {persona.tag}
                    </Chip>
                  </div>

                  {/* Bottom Section */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-light text-white mb-2">
                        {persona.title}
                      </h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        {persona.description}
                      </p>
                    </div>

                    {/* Start Conversation Button */}
                    <StartConversation
                      persona={{
                        personaId: persona.personaId,
                        replicaId: persona.replicaId,
                        mode: persona.mode,
                        title: persona.title,
                      }}
                    />
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
