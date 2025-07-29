import { Search } from "lucide-react";

export function MessageUpdate({ query }: { query: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xl">✨</span>
      <p className="">
        I just resolved entities <span className="font-medium">"{query}"</span>
      </p>
    </div>
  );
}
