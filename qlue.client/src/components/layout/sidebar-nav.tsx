import { cn, Tooltip } from "@heroui/react";
import { Link, useLocation } from "@tanstack/react-router";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import React, { useMemo } from "react";

export type SidebarItem = {
  key: string;
  title: string;
  iconName: IconName;
  href?: string;
};

export const sidebarItems: SidebarItem[] = [
  {
    key: "me",
    href: "/me",
    iconName: "circle-user",
    title: "Profile",
  },
  {
    key: "personas",
    href: "/personas",
    iconName: "users",
    title: "Personas",
  },
];

export type SidebarProps = {
  isCompact?: boolean;
  className?: string;
};

const SidebarNav = React.forwardRef<HTMLElement, SidebarProps>(
  ({ isCompact, className }, ref) => {
    const location = useLocation();
    const activeRoute = location.pathname.split("/")[1];

    const navItems = useMemo(() => {
      return sidebarItems.map((item) => {
        const isActive = activeRoute === item.key;

        const itemContent = (
          <Link
            to={item.href || ""}
            className={cn(
              "flex items-center px-3 min-h-11 rounded-large h-[44px] transition-colors relative group",
              {
                "w-11 h-10 justify-center p-0": isCompact,
                "bg-[#292929] text-primary-foreground": isActive,
                "hover:bg-primary-800/30 text-primary-foreground/80 hover:text-primary-foreground":
                  !isActive,
              }
            )}
          >
            <DynamicIcon
              size={22}
              name={item.iconName}
              className={cn({
                "text-primary-foreground": isActive,
                "text-primary-foreground/80 group-hover:text-primary-foreground":
                  !isActive,
              })}
            />
            {!isCompact && (
              <span
                className={cn("text-sm ml-2", {
                  "text-primary-foreground": isActive,
                  "text-primary-foreground/80 group-hover:text-primary-foreground":
                    !isActive,
                })}
              >
                {item.title}
              </span>
            )}
          </Link>
        );

        return (
          <div key={item.key}>
            {isCompact ? (
              <Tooltip content={item.title} placement="right">
                {itemContent}
              </Tooltip>
            ) : (
              itemContent
            )}
          </div>
        );
      });
    }, [activeRoute, isCompact]);

    return (
      <nav
        ref={ref}
        className={cn(
          "flex flex-col gap-2 flex-grow overflow-y-auto scrollbar-hide",
          className
        )}
      >
        {navItems}
      </nav>
    );
  }
);

SidebarNav.displayName = "SidebarNav";

export default SidebarNav;
