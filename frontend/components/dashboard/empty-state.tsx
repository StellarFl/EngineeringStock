import Link from "next/link";
import type { Route } from "next";

import type { NavItem } from "@/components/dashboard/nav-config";
import { AppIcon, icons, type IconName } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils/cn";


export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: IconName;
  title: string;
  description?: string;
  action?: { label: string; href: NavItem["href"] };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-10 text-center",
        className,
      )}
    >
      <span
        aria-hidden
        className="grid size-11 place-items-center rounded-xl bg-ink-100 text-ink-400"
      >
        <AppIcon name={icon} className="size-5" />
      </span>

      <p className="mt-3 text-sm font-semibold text-ink-700">{title}</p>

      {description && (
        <p className="mt-1 max-w-[34ch] text-xs leading-relaxed text-ink-500">
          {description}
        </p>
      )}

      {action && (
        <Link
          href={action.href as Route}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors duration-200 ease-out-soft hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
        >
          {action.label}
          <AppIcon name={icons.chevronRight} className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
