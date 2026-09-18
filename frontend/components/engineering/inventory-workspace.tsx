"use client";

import { useState } from "react";
import { AppIcon, icons } from "@/components/ui/app-icon";
import { useCreateEngineeringInventory, useEngineeringInventory } from "@/api-services/hooks/useEngineering";

const initialForm = { name: "", specification: "", category: "consumable" as const, quantityOnHand: 0, reorderPoint: 0 };

export function InventoryWorkspace() {
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const { data: items = [], isLoading } = useEngineeringInventory(query);
  const createItem = useCreateEngineeringInventory();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createItem.mutate(form, { onSuccess: () => { setForm(initialForm); setShowForm(false); } });
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Engineering inventory</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">Find what the team needs.</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-500">Search by part name, specification, SKU, or plain-language detail.</p>
        </div>
        <button type="button" onClick={() => setShowForm((value) => !value)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
          <AppIcon name={icons.plus} className="size-4" /> Add inventory
        </button>
      </header>

      {showForm && <form onSubmit={submit} className="grid gap-3 border-y border-ink-200 bg-ink-50/60 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input required placeholder="Item name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm" />
        <input required placeholder="Specification" value={form.specification} onChange={(event) => setForm({ ...form, specification: event.target.value })} className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm" />
        <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as typeof form.category })} className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm"><option value="consumable">Consumable part</option><option value="tool">Tool</option><option value="equipment">Equipment</option></select>
        <input type="number" min="0" placeholder="Quantity" value={form.quantityOnHand} onChange={(event) => setForm({ ...form, quantityOnHand: Number(event.target.value) })} className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm" />
        <button disabled={createItem.isPending} className="h-10 rounded-lg bg-ink-950 px-4 text-sm font-semibold text-white disabled:opacity-50">{createItem.isPending ? "Adding..." : "Save item"}</button>
      </form>}

      <div className="flex items-center gap-3 border-b border-ink-200 pb-4">
        <AppIcon name={icons.search} className="size-4 text-ink-400" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try: 10k ohm resistor, CAT6, torque wrench..." className="w-full bg-transparent text-sm outline-none placeholder:text-ink-400" />
      </div>

      <div className="overflow-hidden border border-ink-200 bg-white">
        <div className="grid grid-cols-[1.5fr_1.4fr_0.8fr_0.7fr_0.8fr] gap-4 border-b border-ink-200 bg-ink-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500"><span>Item</span><span>Specification</span><span>Type</span><span>Available</span><span>Location</span></div>
        {isLoading ? <p className="p-6 text-sm text-ink-500">Loading inventory...</p> : items.length === 0 ? <p className="p-6 text-sm text-ink-500">No inventory matches this search.</p> : items.map((item) => <div key={item.id} className="grid grid-cols-[1.5fr_1.4fr_0.8fr_0.7fr_0.8fr] gap-4 border-b border-ink-100 px-4 py-4 text-sm last:border-0"><div><p className="font-semibold text-ink-900">{item.name}</p><p className="mt-1 text-xs text-ink-400">{item.sku || "No SKU"}</p></div><span className="text-ink-600">{item.specification}</span><span className="capitalize text-ink-600">{item.category}</span><span className={item.quantityOnHand <= item.reorderPoint ? "font-semibold text-danger-600" : "text-ink-700"}>{item.quantityOnHand}</span><span className="text-ink-600">{item.site?.name || "Unassigned"}</span></div>)}
      </div>
    </section>
  );
}