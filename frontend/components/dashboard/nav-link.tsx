"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { memo } from "react";

import { AppIcon } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "@/components/dashboard/nav-config";

export const NavLink = memo(function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href as Route}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-3 text-sm font-medium",
        "transition-[background-color,color] duration-200 ease-out-soft",
        collapsed && "justify-center px-2",
        active
          ? "bg-brand-500 text-white"
          : "text-brand-100 hover:bg-white/10 hover:text-white",
      )}
    >
      {/* Active rail marker */}
      <span
        aria-hidden
        className={cn(
          "absolute top-1/2 left-0 h-7 w-0.5 -translate-y-1/2 bg-brand-200",
          "transition-opacity duration-200 ease-out-soft",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <AppIcon name={item.icon} className="size-5" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
});
