import { motion } from "framer-motion";

interface MessageUpdateProps {
  message: string;
  reasoning?: string;
  stage: string;
}

export function MessageUpdate({ message, reasoning, stage }: MessageUpdateProps) {
  // Get emoji based on stage
  const getStageEmoji = (stage: string) => {
    switch (stage) {
      case "entity_resolution": return "🔍";
      case "domain_expansion": return "🌐";
      case "cross_domain_insights": return "🔗";
      case "final_synthesis": return "✨";
      default: return "🤖";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-2"
    >
      <span className="text-xl">{getStageEmoji(stage)}</span>
      <div className="flex flex-col">
        <p className="text-sm font-medium text-black">
          {message}
        </p>
        {reasoning && (
          <p className="text-xs text-default-500 mt-1">
            {reasoning}
          </p>
        )}
      </div>
    </motion.div>
  );
}
