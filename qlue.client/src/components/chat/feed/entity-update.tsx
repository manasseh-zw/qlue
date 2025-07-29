import { Avatar, Chip } from "@heroui/react";

export default function EntityUpdate() {
  return (
    <div className="flex items-start gap-3">
      <Avatar
        src="https://static.stacker.com/s3fs-public/styles/sar_screen_maximum_large/s3/2023-06/whitney-houston-smiling_0.jpg"
        size="sm"
        className="w-8 h-8 rounded-full flex-shrink-0"
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-black">
            Whitney Houston
          </span>
          <Chip
            size="sm"
            variant="light"
            className="border-[.3px] h-5 border-zinc-700"
          >
            Artist
          </Chip>
        </div>
        <div className="mt-1 prose prose-sm ">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          quos. Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing
          elit. Quisquam,
        </div>
      </div>
    </div>
  );
}
