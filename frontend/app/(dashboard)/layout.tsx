"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { DesktopSidebar, MobileSidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { loadAuthSession } from "@/lib/auth/session";
import { useAppSelector } from "@/store/hooks";
import { StoreProvider } from "@/store/store-provider";
import Script from "next/script";

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
          <main className="mx-auto min-h-0 w-full max-w-375 flex-1 space-y-5 overflow-y-auto px-4 pb-10 pt-6 sm:px-8 sm:pt-8 lg:px-12">
            {children}
          </main>
        </div>
        <Script
          src="https://widget.swiftagents.org/dist/widget-ui.js"
          data-company-id="86fef8e9-d1aa-469f-86a9-38850c362724"
          data-api-key={process.env.NEXT_PUBLIC_SWIFT_API_KEY}
          defer
        ></Script>
      </div>
    
    </StoreProvider>
  );
}
