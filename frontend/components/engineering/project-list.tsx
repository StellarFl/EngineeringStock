"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import {
  useCreateEngineeringProject,
  useCreateProjectAllocation,
  useEngineeringInventory,
  useEngineeringProjects,
  useEngineeringSites,
} from "@/api-services/hooks/useEngineering";
import { AppIcon, icons } from "@/components/ui/app-icon";

const initialProject = { name: "", code: "", customerName: "", status: "planned", siteId: "", description: "" };

export function ProjectList() {
  const { data: projects = [], isLoading } = useEngineeringProjects();
  const { data: sites = [] } = useEngineeringSites();
  const { data: inventory = [] } = useEngineeringInventory("");
  const createProject = useCreateEngineeringProject();
  const allocate = useCreateProjectAllocation();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState(initialProject);
  const [allocation, setAllocation] = useState<Record<string, { inventoryItemId: string; quantity: number }>>({});

  const submitProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createProject.mutate({ ...projectForm, siteId: projectForm.siteId || undefined }, {
      onSuccess: () => { setProjectForm(initialProject); setShowProjectForm(false); },
    });
  };

  const submitAllocation = (event: FormEvent<HTMLFormElement>, projectId: string) => {
    event.preventDefault();
    const row = allocation[projectId];
    if (!row?.inventoryItemId) return;
    allocate.mutate({ projectId, inventoryItemId: row.inventoryItemId, quantity: row.quantity }, {
      onSuccess: () => setAllocation((current) => ({ ...current, [projectId]: { inventoryItemId: "", quantity: 1 } })),
    });
  };

  return <section className="space-y-6">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Resource planning</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">Projects and allocations</h1><p className="mt-2 text-sm text-ink-500">Create an engineering job, then assign the parts and equipment it needs.</p></div><button type="button" onClick={() => setShowProjectForm((value) => !value)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"><AppIcon name={icons.plus} className="size-4" /> New project</button></header>
    {showProjectForm && <form onSubmit={submitProject} className="space-y-4 border border-ink-200 bg-white p-5"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><label className="space-y-2 text-sm font-medium text-ink-700">Project name<input required value={projectForm.name} onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })} placeholder="e.g. Lagos Tower Upgrade" className="mt-1 h-10 w-full rounded-lg border border-ink-200 px-3 text-sm" /></label><label className="space-y-2 text-sm font-medium text-ink-700">Project code<input value={projectForm.code} onChange={(event) => setProjectForm({ ...projectForm, code: event.target.value })} placeholder="e.g. LT-2026-04" className="mt-1 h-10 w-full rounded-lg border border-ink-200 px-3 text-sm" /></label><label className="space-y-2 text-sm font-medium text-ink-700">Customer<input value={projectForm.customerName} onChange={(event) => setProjectForm({ ...projectForm, customerName: event.target.value })} placeholder="Customer or client" className="mt-1 h-10 w-full rounded-lg border border-ink-200 px-3 text-sm" /></label><label className="space-y-2 text-sm font-medium text-ink-700">Site<select value={projectForm.siteId} onChange={(event) => setProjectForm({ ...projectForm, siteId: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm"><option value="">Select site</option>{sites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}</select></label></div><div className="grid gap-4 md:grid-cols-2"><label className="space-y-2 text-sm font-medium text-ink-700">Status<select value={projectForm.status} onChange={(event) => setProjectForm({ ...projectForm, status: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm"><option value="planned">Planned</option><option value="active">Active</option><option value="on_hold">On hold</option></select></label><label className="space-y-2 text-sm font-medium text-ink-700">Description<textarea value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} placeholder="What is this project delivering?" className="mt-1 min-h-10 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" /></label></div><div className="flex justify-end gap-3"><button type="button" onClick={() => setShowProjectForm(false)} className="h-10 rounded-lg border border-ink-200 px-4 text-sm font-semibold text-ink-700">Cancel</button><button disabled={createProject.isPending} type="submit" className="h-10 rounded-lg bg-ink-950 px-5 text-sm font-semibold text-white disabled:opacity-50">{createProject.isPending ? "Creating..." : "Create project"}</button></div></form>}

    <div className="grid gap-4 md:grid-cols-2">{isLoading ? <p className="text-sm text-ink-500">Loading projects...</p> : projects.length === 0 ? <p className="border border-dashed border-ink-300 bg-white p-10 text-sm text-ink-500">No projects have been created yet. Create the first project above.</p> : projects.map((project) => { const row = allocation[project.id] ?? { inventoryItemId: "", quantity: 1 }; return <article key={project.id} className="border border-ink-200 bg-white p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-ink-900">{project.name}</h2><p className="mt-1 text-xs text-ink-500">{project.code || "No project code"} {project.site ? `· ${project.site.name}` : ""}</p></div><span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold capitalize text-brand-700">{project.status.replace("_", " ")}</span></div><div className="mt-5 border-t border-ink-100 pt-4"><p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Allocated resources</p>{project.allocations.length ? <ul className="mt-3 space-y-2">{project.allocations.map((item, index) => <li key={`${item.inventoryItem.name}-${index}`} className="flex justify-between text-sm"><span className="text-ink-700">{item.inventoryItem.name}</span><span className="font-semibold text-ink-900">{item.quantity}</span></li>)}</ul> : <p className="mt-3 text-sm text-ink-500">Nothing allocated yet.</p>}<form onSubmit={(event) => submitAllocation(event, project.id)} className="mt-4 flex flex-col gap-2 border-t border-ink-100 pt-4 sm:flex-row"><select required value={row.inventoryItemId} onChange={(event) => setAllocation((current) => ({ ...current, [project.id]: { ...row, inventoryItemId: event.target.value } }))} className="h-10 min-w-0 flex-1 rounded-lg border border-ink-200 bg-white px-3 text-sm"><option value="">Add inventory item</option>{inventory.filter((item) => item.quantityOnHand > 0).map((item) => <option key={item.id} value={item.id}>{item.name} · {item.quantityOnHand} available</option>)}</select><input required type="number" min="1" value={row.quantity} onChange={(event) => setAllocation((current) => ({ ...current, [project.id]: { ...row, quantity: Number(event.target.value) } }))} className="h-10 w-full rounded-lg border border-ink-200 px-3 text-sm sm:w-24" aria-label="Allocation quantity" /><button disabled={allocate.isPending} type="submit" className="h-10 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white disabled:opacity-50">Allocate</button></form></div></article>; })}</div>
  </section>;
}
