"use client";

import Image from "next/image";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh bg-ink-50 text-ink-900 lg:grid lg:grid-cols-[15rem_minmax(22rem,34rem)_minmax(18rem,1fr)]">
      <aside className="flex flex-col justify-between border-b border-brand-900 bg-brand-900 px-6 py-7 text-brand-50 lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div>
          <Logo className="text-2xl text-brand-50" />
          <p className="mt-3 max-w-[14ch] font-mono text-[10px] leading-5 tracking-[0.16em] text-brand-200 uppercase">Field inventory / secure access</p>
        </div>
        <div className="hidden space-y-5 lg:block">
          <div className="h-px bg-white/15" />
          <p className="font-mono text-[10px] leading-5 text-brand-200">01 / identify<br />02 / access<br />03 / operate</p>
        </div>
      </aside>

      <main className="flex min-h-dvh items-start px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-20">
        <div className="w-full max-w-xl">{children}</div>
      </main>

      <aside className="relative hidden overflow-hidden border-l border-ink-200 bg-brand-50 lg:block">
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <div className="max-w-xs">
            <p className="font-mono text-[10px] tracking-[0.18em] text-brand-600 uppercase">Operations brief / 01</p>
            <h2 className="mt-5 text-4xl font-bold leading-[0.95] text-brand-900">Every handoff leaves a trace.</h2>
            <p className="mt-5 text-sm leading-7 text-brand-800/75">Keep parts, equipment, projects, and site evidence moving with the people who need them.</p>
          </div>
          <Image src="/auth-image.png" alt="Engineering field equipment" width={560} height={560} className="w-full object-contain object-bottom" priority />
        </div>
      </aside>
    </div>
  );
}
