"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { DesktopSidebar, MobileSidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { loadAuthSession } from "@/lib/auth/session";
import { useAppSelector } from "@/store/hooks";
import { StoreProvider } from "@/store/store-provider";
import { AppIcon, icons } from "@/components/ui/app-icon";

function DashboardAuthGuard() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    const hasToken = Boolean(token || loadAuthSession()?.token);
    if (!hasToken) {
      router.replace("/login");
    }
  }, [router, token]);

  return null;
}


export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <StoreProvider>
      <DashboardAuthGuard />
      <div className="min-h-dvh bg-ink-50">
        <DesktopSidebar />
        <MobileSidebar />

        <div className="flex min-h-dvh min-w-0 flex-col">
          <Topbar />
          <main className="mx-auto min-h-0 w-full max-w-[1500px] flex-1 space-y-5 overflow-y-auto px-4 pb-10 pt-6 sm:px-8 sm:pt-8 lg:px-12">
            {children}
          </main>
        </div>
      </div>
      <button
        type="button"
        aria-label="Open support chat"
        title="Support chat"
        className="fixed right-5 bottom-5 z-50 grid size-14 place-items-center rounded-full bg-brand-700 text-brand-50 shadow-[0_12px_28px_rgba(71,36,28,0.24)] transition-colors hover:bg-brand-800 focus-visible:outline-brand-500 sm:right-8 sm:bottom-8"
      >
        <AppIcon name={icons.chat} className="size-6" />
      </button>
    </StoreProvider>
  );
}
