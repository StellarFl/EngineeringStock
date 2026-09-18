"use client";

import Link from "next/link";
import type { Route } from "next";
import { AppIcon, icons } from "@/components/ui/app-icon";
import { useEngineeringDashboard } from "@/api-services/hooks/useEngineering";

const metrics = [
  { key: "inventoryCount", label: "Tracked items", icon: icons.products },
  { key: "activeProjects", label: "Active projects", icon: icons.compass },
  { key: "openCheckouts", label: "Open checkouts", icon: icons.receipt },
  { key: "overdueCheckouts", label: "Overdue", icon: icons.alert },
] as const;

export function EngineeringDashboard() {
  const { data, isLoading } = useEngineeringDashboard();
  return <section className="space-y-7">
    <header><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">ForgeTrack overview</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">Keep engineering work moving.</h1><p className="mt-2 text-sm text-ink-500">A live view of inventory, project resources, and equipment accountability.</p></header>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <div key={metric.key} className="border border-ink-200 bg-white p-5"><div className="flex items-center justify-between"><span className="text-sm text-ink-500">{metric.label}</span><AppIcon name={metric.icon} className="size-4 text-brand-600" /></div><p className="mt-5 text-3xl font-semibold tracking-tight text-ink-950">{isLoading ? "-" : data?.[metric.key] ?? 0}</p></div>)}</div>
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="border border-ink-200 bg-white"><div className="flex items-center justify-between border-b border-ink-200 px-5 py-4"><div><h2 className="font-semibold text-ink-900">Needs attention</h2><p className="mt-1 text-xs text-ink-500">Items at or below their reorder point.</p></div><Link href="/inventory" className="text-xs font-semibold text-brand-700">View inventory</Link></div>{data?.lowStock?.length ? data.lowStock.map((item) => <div key={item.id} className="flex items-center justify-between border-b border-ink-100 px-5 py-4 last:border-0"><div><p className="text-sm font-semibold text-ink-900">{item.name}</p><p className="mt-1 text-xs text-ink-500">{item.specification}</p></div><span className="text-sm font-semibold text-danger-600">{item.quantityOnHand} left</span></div>) : <p className="p-5 text-sm text-ink-500">No low-stock items.</p>}</div>
      <div className="border border-ink-200 bg-ink-950 p-6 text-white"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">Quick actions</p><h2 className="mt-3 text-xl font-semibold">Make the next handoff visible.</h2><p className="mt-2 text-sm leading-6 text-ink-300">Add a specification-rich item, review an overdue checkout, or open a project allocation view.</p><div className="mt-6 flex flex-wrap gap-2"><Link href={"/inventory" as Route} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-ink-900">Add inventory</Link><Link href={"/checkouts" as Route} className="rounded-lg border border-ink-700 px-3 py-2 text-xs font-semibold text-white">Review checkouts</Link></div></div>
    </div>
  </section>;
}