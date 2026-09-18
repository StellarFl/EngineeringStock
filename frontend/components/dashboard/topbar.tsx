"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { MobileNavTrigger } from "@/components/dashboard/mobile-nav-trigger";
import { TopbarSearch } from "@/components/dashboard/topbar-search";
import { AppIcon, icons } from "@/components/ui/app-icon";
import { clearAuth } from "@/store/slices/auth.slice";
import { clearAuthSession } from "@/lib/auth/session";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

function getInitials(user: { name: string; email: string } | null) {
  const source = user?.name || user?.email || "Account";
  const parts = source.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "A";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function Topbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const initials = getInitials(user);

  function signOut() {
    clearAuthSession();
    dispatch(clearAuth());
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 flex h-[4.5rem] shrink-0 items-center gap-3 border-b border-ink-200 bg-ink-50 px-4 sm:px-8 lg:px-10">
      <MobileNavTrigger />
      <div className="hidden min-w-0 sm:block">
        <p className="font-mono text-[10px] tracking-[0.2em] text-ink-400 uppercase">ForgeTrack / workspace</p>
        <p className="mt-1 truncate font-display text-lg font-semibold text-ink-900">Engineering command desk</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <TopbarSearch />

        <button
          type="button"
          className="grid size-10 place-items-center border border-ink-200 text-ink-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          aria-label="Notifications"
        >
          <AppIcon name={icons.bell} className="size-5" />
        </button>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex items-center gap-3 border border-ink-200 bg-white px-2.5 py-1.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50"
          >
            {user?.avatar ? (
              <img src={user?.avatar} className="size-8 rounded-full" />
            ) : (
              <span className="grid size-8 place-items-center bg-brand-600 text-sm font-semibold text-white">
                {initials}
              </span>
            )}
            <span className="hidden min-w-0 flex-col sm:flex">
              <span className="max-w-40 truncate text-sm font-semibold text-ink-900">
                {user?.name || "Account"}
              </span>
              <span className="max-w-40 truncate text-xs text-ink-500 capitalize">
                {user?.memberships[0]?.role || "Logged in"}
              </span>
            </span>
            <AppIcon
              name={icons.chevronDown}
              className={`size-4 text-ink-500 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open ? (
            <div className="absolute right-0 top-[calc(100%+0.75rem)] w-72 overflow-hidden border border-ink-200 bg-ink-50 shadow-[0_20px_50px_rgba(71,36,28,0.16)]">
              <div className="border-b border-ink-100 px-4 py-4">
                <div className="flex items-center gap-3">
                  {user?.avatar ? (
                    <img src={user.avatar} className="size-8 rounded-full" />
                  ) : (
                    <span className="grid size-11 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                      {initials}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-900">
                      {user?.name || "Account"}
                    </p>
                    <p className="truncate text-sm text-ink-500">
                      {user?.email || "No email available"}
                    </p>
                    <p className="mt-1 inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                      {user?.memberships[0]?.role || "User"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button
                  type="button"
                  onClick={signOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger-600 transition-colors hover:bg-danger-50"
                >
                  <AppIcon name={icons.logout} className="size-4" />
                  Sign out
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
