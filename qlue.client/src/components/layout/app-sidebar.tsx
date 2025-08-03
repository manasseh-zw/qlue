import { Button, cn, Spacer, Tooltip } from "@heroui/react";
import React from "react";
import { useMediaQuery } from "usehooks-ts";
import { ChevronLeft, ChevronRight, LogOut, SidebarIcon } from "lucide-react";
import SidebarNav from "./sidebar-nav";
import SidebarDrawer from "./sidebar-drawer";
import Logo from "../logo";
import Avatar from "boring-avatars";
import { authState } from "../../lib/state/auth.state";

const SIDEBAR_COLLAPSED_KEY = "jude-sidebar-collapsed";

export default function AppSidebar() {
  const { user } = authState.state;
  const [isOpen, setIsOpen] = React.useState(false);

  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      return savedState ? JSON.parse(savedState) : false;
    }
    return false;
  });

  const isMobile = useMediaQuery("(max-width: 640px)");

  const onToggle = React.useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (typeof window !== "undefined") {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(newState));
    }
  }, [isCollapsed]);

  React.useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
      setIsCollapsed(false);
    }
  }, [isMobile]);

  const SidebarContent = () => (
    <div
      className={cn(
        "will-change relative flex h-full w-[16	rem] flex-col bg-[#18181A]  border-gray-200 py-6 px-4 transition-width",
        {
          "w-[64px] items-center px-[4px] py-6": isCollapsed,
        }
      )}
    >
      <div
        className={cn("flex items-center justify-between gap-2 pl-4", {
          "justify-center gap-0 pl-0": isCollapsed,
        })}
      >
        <div className="flex items-center justify-center rounded-full gap-2">
          <Logo width={42} height={42} />
          <span
            className={cn(
              "w-full uppercase text-xl font-light text-gray-100 mt-1",
              {
                hidden: isCollapsed,
              }
            )}
          >
            Qlue
          </span>
        </div>

        <div className={cn("flex-end flex", { hidden: isCollapsed })}>
          <ChevronLeft
            className="cursor-pointer text-gray-600 hover:text-gray-800"
            size={24}
            onClick={isMobile ? () => setIsOpen(false) : onToggle}
          />
        </div>
      </div>

      <Spacer y={6} />
      <div className="flex items-center gap-3 px-3 text-gray-100">
        <Avatar
          name={user?.name ?? "you"}
          size={36}
          variant="beam"
          colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
        />
        <div
          className={cn("flex max-w-full flex-col overflow-hidden", {
            hidden: isCollapsed,
          })}
        >
          <p
            className="text-small text-gray-100 truncate"
            title={user?.name || ""}
          >
            {user?.name?.substring(0, 25)}
            {user?.name && user.name.length > 25 ? "..." : ""}
          </p>
          <p className="text-tiny text-gray-400">Guardian of the Galaxy</p>
        </div>
      </div>

      <Spacer y={6} />

      <SidebarNav isCompact={isCollapsed} />

      <Spacer y={8} />

      <div
        className={cn("mt-auto flex flex-col", {
          "items-center": isCollapsed,
        })}
      >
        {isCollapsed && (
          <Button
            isIconOnly
            className="flex h-9 w-9 text-gray-600 hover:text-gray-800"
            size="sm"
            variant="light"
            onClick={onToggle}
          >
            <ChevronRight size={24} />
          </Button>
        )}

        <Tooltip content="Log Out" isDisabled={!isCollapsed} placement="right">
          <button
            className={cn(
              "flex items-center gap-2 px-3 min-h-11 rounded-large h-[44px] transition-colors hover:bg-gray-100",
              {
                "justify-center w-10 h-10 p-0": isCollapsed,
              }
            )}
          >
            <LogOut
              className="rotate-180 text-gray-600 hover:text-gray-800"
              size={24}
            />
            {!isCollapsed && (
              <span className="text-small text-gray-600 hover:text-gray-800">
                Log Out
              </span>
            )}
          </button>
        </Tooltip>
      </div>
    </div>
  );

  return (
    <>
      {isMobile && !isOpen && (
        <Button
          isIconOnly
          className="fixed top-4 left-4 z-50 text-gray-600 bg-transparent md:hidden"
          size="sm"
          variant="flat"
          onPress={() => setIsOpen(true)}
        >
          <SidebarIcon size={24} />
        </Button>
      )}

      {isMobile ? (
        <SidebarDrawer
          className={cn("min-w-[16rem] rounded-lg overflow-hidden w-min", {
            "min-w-[64px]": isCollapsed,
          })}
          hideCloseButton={true}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        >
          <SidebarContent />
        </SidebarDrawer>
      ) : (
        <div
          className={cn("min-w-[16rem] h-full overflow-hidden md:block", {
            "min-w-[64px]": isCollapsed,
          })}
        >
          <SidebarContent />
        </div>
      )}
    </>
  );
}
