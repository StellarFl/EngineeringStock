"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

import { AppIcon, icons } from "@/components/ui/app-icon";
import { Logo } from "@/components/brand/logo";
import { NavLink } from "@/components/dashboard/nav-link";
import { primaryNav, secondaryNav } from "@/components/dashboard/nav-config";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMobileNavOpen, toggleSidebar } from "@/store/slices/ui.slice";
import { cn } from "@/lib/utils/cn";
import { clearAuth } from "@/store/slices/auth.slice";
import { clearAuthSession } from "@/lib/auth/session";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { RequireRole } from "@/components/auth/require-role";

function NavSections({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const logout = () => {
    clearAuthSession();
    dispatch(clearAuth());
    toast.success("Logout successful. Login to access your account");
    router.push("/login");
  };

  return (
    <>
      <nav
        aria-label="Main"
        className={cn("min-h-0 flex-1 space-y-1 overflow-y-auto px-4", !onNavigate && "flex flex-row flex-wrap items-center gap-1 space-y-0")}
      >
        {primaryNav.map((item) => (
          item.href === "/users" ? (
            <RequireRole key={item.href} roles={["admin"]}>
              <NavLink
                item={item}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            </RequireRole>
          ) : (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          )
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-white/15 px-4 pt-4 lg:flex-row lg:border-l lg:border-t-0 lg:pt-0 lg:pl-4 lg:pt-0">
        {secondaryNav.map((item) => (
          <button
            key={item.label}
            type="button"
            title={collapsed ? item.label : undefined}
            onClick={() => logout()}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-brand-100",
              "transition-colors duration-200 ease-out-soft hover:bg-white/10 hover:text-white",
              collapsed && "justify-center px-2",
            )}
          >
            <AppIcon name={item.icon} className="size-5" />
            {!collapsed && item.label}
          </button>
        ))}
      </div>
    </>
  );
}

export function DesktopSidebar() {
  const collapsed = false;

  return (
    <aside
      className={cn(
        "hidden w-full flex-row items-center gap-6 border-b border-brand-900 bg-brand-900 px-6 py-4 text-brand-50 lg:flex",
        "sticky top-0 z-40",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center px-0",
          "justify-between",
        )}
      >
        {!collapsed && (
          <div className="min-w-0">
            <Logo tight className="text-brand-50" />
            <p className="mt-1 truncate font-mono text-[9px] tracking-[0.18em] text-brand-200 uppercase">
              Field operations / 01
            </p>
          </div>
        )}
        <span aria-hidden className="hidden size-8 shrink-0 lg:block" />
      </div>

      <NavSections collapsed={collapsed} />
    </aside>
  );
}

/** Slide-over drawer below `lg`. */
export function MobileSidebar() {
  const open = useAppSelector((s) => s.ui.mobileNavOpen);
  const dispatch = useAppDispatch();
  const close = () => dispatch(setMobileNavOpen(false));

  // Escape to dismiss, and lock body scroll while the drawer covers the page.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch(setMobileNavOpen(false));
    };
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, dispatch]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="absolute inset-0 bg-brand-900/70"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            // Spring rather than a duration — reads as physical, and interrupting
            // it mid-flight (open → close fast) stays smooth instead of snapping.
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[82vw] flex-col gap-6 border-r border-brand-900 bg-brand-900 py-6 text-brand-50"
          >
            <div className="flex items-center justify-between px-4">
              <div className="min-w-0">
                <Logo tight className="text-brand-50" />
                <p className="mt-1 truncate font-mono text-[9px] tracking-[0.18em] text-brand-200 uppercase">
                  Field operations / 01
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close navigation"
                className="grid size-8 place-items-center text-brand-200 transition-colors duration-150 hover:bg-white/10 hover:text-white"
              >
                <AppIcon name={icons.close} className="size-5" />
              </button>
            </div>

            <NavSections onNavigate={close} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
