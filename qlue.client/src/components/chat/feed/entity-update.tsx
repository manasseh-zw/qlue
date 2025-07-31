import { Avatar, Chip } from "@heroui/react";
import { useState } from "react";
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
  const [imageSrc, setImageSrc] = useState(
    entity.properties.image.url ||
      `https://boring-avatars-api.vercel.app/api/avatar?size=40&variant=bauhaus&name=${entity.name}`
  );

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

  return (
    <div className="flex items-start gap-3 min-w-0">
      <Avatar
        src={imageSrc}
        size="sm"
        radius="none"
        className="w-8 h-8 rounded-none flex-shrink-0"
        name={entity.name.charAt(0)}
        onError={() => {
          setImageSrc(
            `https://boring-avatars-api.vercel.app/api/avatar?size=40&variant=bauhaus&name=${entity.name}`
          );
        }}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-black break-words">
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
          <p className="text-xs text-default-600 mb-1 break-words leading-relaxed">
            {entity.properties.short_description}
          </p>
          {/* <p className="text-xs text-default-500 break-words leading-relaxed">
            {context.reasoning}
          </p> */}
        </div>
      </div>
    </div>
  );
}
