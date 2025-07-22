import { Github, LogOut } from "lucide-react";
import {
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import Logo from "./logo";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/providers/auth.provider";

export default function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-8 py-6">
      <div className="flex items-center space-x-2">
        <Logo width={36} height={36} />
        <span className="text-4xl font-light text-zinc-900 font-sans">
          Qlue
        </span>
      </div>

      <div className="flex items-center space-x-3">
        {/* GitHub Link */}
        <a
          href="https://github.com/manasseh-zw/qlue"
          target="_blank"
          rel="noopener noreferrer"
          className="group p-2 rounded-full bg-zinc-800 border-zinc-900 hover:bg-zinc-900 transition-colors"
        >
          <Github
            strokeWidth={1}
            className="w-6 h-6 text-white transition-colors group-hover:text-white"
          />
        </a>

        {/* User Menu */}
        {isAuthenticated && user && (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                as="button"
                className="transition-transform hover:scale-105"
                src={user.image}
                name={user.name}
                size="md"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{user.email}</p>
              </DropdownItem>
              <DropdownItem key="status" className="h-10 gap-2">
                <p className="text-small text-default-500">
                  Status:{" "}
                  {user.onboarding === "COMPLETE"
                    ? "Profile Complete"
                    : user.onboarding === "CHAT"
                      ? "Building Profile"
                      : "Getting Started"}
                </p>
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                onClick={handleSignOut}
                startContent={<LogOut className="w-4 h-4" />}
              >
                Sign Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
    </header>
  );
}
