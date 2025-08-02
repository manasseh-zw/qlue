import { Card, CardBody, Chip, Image } from "@heroui/react";

export const EntityCard = ({ entity }: { entity: any; type?: string }) => {
  // Debug logging console.log("Entity data:", entity);
  // Add null checks and fallbacks
  if (!entity || !entity.properties) {
    console.warn("Invalid entity structure:", entity);
    return (
      <Card className="w-full min-w-[180px] max-w-[220px] border border-gray-100">
        <CardBody className="p-3">
          <h4 className="font-medium text-sm truncate">Invalid Entity</h4>
          <p className="text-xs text-gray-500 mt-1">Data structure error</p>
        </CardBody>
      </Card>
    );
  }
  return (
    <Card className="w-full min-w-[200px] max-w-[220px] hover:scale-105 transition-transform duration-200 cursor-pointer border border-gray-100">
      <CardBody className="p-0">
        <div className="relative w-full aspect-square">
          <Image
            alt={entity.name || "Unknown"}
            className="w-full h-full object-top object-cover aspect-square"
            src={
              entity.properties.image?.url ||
              "https://via.placeholder.com/200x200?text=No+Image"
            }
            fallbackSrc="https://via.placeholder.com/200x200?text=No+Image"
          />
        </div>
        <div className="p-3">
          <h4 className="font-medium text-sm truncate">
            {entity.name || "Unknown"}
          </h4>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {entity.properties.short_description || "No description available"}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {entity.tags?.slice(0, 2).map((tag: any, index: number) => (
              <Chip key={index} size="sm" variant="flat" className="text-xs">
                {tag.name.length > 10
                  ? `${tag.name.substring(0, 10)}...`
                  : tag.name}
              </Chip>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
