import { Github } from "lucide-react";
import Logo from "./logo";

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-8 py-6">
      <div className="flex items-center space-x-2 ">
        <Logo width={36} height={36} />
        <span className="text-4xl font-light text-zinc-900 font-sans">
          Qlue
        </span>
      </div>

      <a
        href="https://github.com/manasseh-zw/qlue"
        target="_blank"
        rel="noopener noreferrer"
        className="group p-2 rounded-full bg-zinc-800  border-zinc-900 hover:bg-zinc-900 transition-colors"
      >
        <Github
          strokeWidth={1}
          className="w-6 h-6 text-white transition-colors group-hover:text-white"
        />
      </a>
    </header>
  );
}
