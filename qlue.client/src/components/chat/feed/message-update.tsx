import type { MessageData } from "./types";

type MessageUpdateProps = {
  message: string;
  reasoning?: string;
  stage: string;
};

export function MessageUpdate({
  message,
  reasoning,
  stage,
}: MessageUpdateProps) {
  // Get emoji based on stage
  const getStageEmoji = (stage: string) => {
    switch (stage) {
      case "entity_resolution":
        return "🔍";
      case "domain_expansion":
        return "🌐";
      case "cross_domain_insights":
        return "🔗";
      case "final_synthesis":
        return "✨";
      case "error":
        return "⚠️";
      default:
        return "🤖";
    }
  };

  // Truncate text to prevent overflow
  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <div className="flex items-start gap-2 min-w-0">
      <span className="text-xl flex-shrink-0">{getStageEmoji(stage)}</span>
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <p className="text-sm font-medium text-black overflow-hidden text-ellipsis whitespace-nowrap">
          {truncateText(message)}
        </p>
        {reasoning && (
          <p className="text-xs text-default-500 mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {truncateText(reasoning, 100)}
          </p>
        )}
      </div>
    </div>
  );
}
