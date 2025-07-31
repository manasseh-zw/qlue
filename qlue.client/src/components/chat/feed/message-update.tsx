import type { MessageData } from "./types";
import Logo from "../../logo";

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
  return (
    <div className=" flex items-start gap-2 min-w-0">
      <Logo width={24} height={24} />
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-md  text-black break-words leading-relaxed">
          {message}
        </p>
        {reasoning && (
          <p className="text-xs text-zinc-700 mt-2 break-words leading-relaxed">
            {reasoning}
          </p>
        )}
      </div>
    </div>
  );
}
