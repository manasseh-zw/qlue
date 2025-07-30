import { Avatar, Chip } from "@heroui/react";
import { motion } from "framer-motion";
import type { EntityData } from "./types";

type EntityUpdateProps = {
  entity: EntityData;
  context: {
    stage: string;
    reasoning: string;
    domainType?: string;
  };
};

export default function EntityUpdate({ entity, context }: EntityUpdateProps) {
  // Determine chip color based on domain type
  const getChipColor = (type?: string) => {
    switch (type) {
      case "music":
        return "primary";
      case "podcasts":
        return "secondary";
      case "movies":
        return "warning";
      case "books":
        return "success";
      default:
        return "default";
    }
  };

  // Get display type from entity_id or domain type
  const getDisplayType = () => {
    if (context.domainType) {
      return (
        context.domainType.charAt(0).toUpperCase() + context.domainType.slice(1)
      );
    }

    if (entity.entity_id.includes("artist")) return "Artist";
    if (entity.entity_id.includes("podcast")) return "Podcast";
    if (entity.entity_id.includes("movie")) return "Movie";
    if (entity.entity_id.includes("book")) return "Book";
    return "Entity";
  };

  // Truncate text to prevent overflow
  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 min-w-0"
    >
      <Avatar
        src={entity.properties.image.url || "https://via.placeholder.com/32"}
        size="sm"
        className="w-8 h-8 rounded-full flex-shrink-0"
        showFallback
        name={entity.name.charAt(0)}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-black truncate">
            {entity.name}
          </span>
          <Chip
            size="sm"
            variant="light"
            color={getChipColor(context.domainType)}
            className="border-[.3px] h-5 flex-shrink-0"
          >
            {getDisplayType()}
          </Chip>
        </div>
        <div className="mt-1 prose prose-sm min-w-0">
          <p className="text-xs text-default-600 mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {truncateText(entity.properties.short_description, 100)}
          </p>
          <p className="text-xs text-default-500 overflow-hidden text-ellipsis whitespace-nowrap">
            {truncateText(context.reasoning, 80)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
