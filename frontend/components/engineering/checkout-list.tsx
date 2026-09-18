"use client";

import { useEngineeringCheckouts } from "@/api-services/hooks/useEngineering";
import {
  useCreateEngineeringCheckout,
  useEngineeringInventory,
  useEngineeringProjects,
  useEngineeringTeamMembers,
} from "@/api-services/hooks/useEngineering";
import { useState } from "react";
import { AppIcon, icons } from "@/components/ui/app-icon";

type CheckoutRow = { inventoryItemId: string; quantity: number };

export function CheckoutList() {
  const { data: checkouts = [], isLoading } = useEngineeringCheckouts();
  const { data: members = [] } = useEngineeringTeamMembers();
  const { data: projects = [] } = useEngineeringProjects();
  const { data: inventory = [] } = useEngineeringInventory("");
  const createCheckout = useCreateEngineeringCheckout();
  const [showForm, setShowForm] = useState(false);
  const [borrowerId, setBorrowerId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [expectedReturnAt, setExpectedReturnAt] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<CheckoutRow[]>([{ inventoryItemId: "", quantity: 1 }]);

  const resetForm = () => {
    setBorrowerId(""); setProjectId(""); setExpectedReturnAt(""); setNotes("");
    setItems([{ inventoryItemId: "", quantity: 1 }]); setShowForm(false);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createCheckout.mutate({
      borrowerId, projectId: projectId || undefined, expectedReturnAt, notes: notes || undefined,
      items: items.filter((item) => item.inventoryItemId),
    }, { onSuccess: resetForm });
  };

  return <section className="space-y-6"><header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Equipment accountability</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">Checkouts and returns</h1><p className="mt-2 text-sm text-ink-500">Every shared tool has an owner, a project, and a return date.</p></div><button type="button" onClick={() => setShowForm((value) => !value)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"><AppIcon name={icons.plus} className="size-4" /> New checkout</button></header>
    {showForm && <form onSubmit={submit} className="space-y-5 border border-ink-200 bg-white p-5"><div className="grid gap-4 md:grid-cols-3"><label className="space-y-2 text-sm font-medium text-ink-700">Borrower<select required value={borrowerId} onChange={(event) => setBorrowerId(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm font-normal"><option value="">Select engineer</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name} · {member.email}</option>)}</select></label><label className="space-y-2 text-sm font-medium text-ink-700">Project <span className="font-normal text-ink-400">(optional)</span><select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm font-normal"><option value="">No project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label className="space-y-2 text-sm font-medium text-ink-700">Expected return<select required value={expectedReturnAt} onChange={(event) => setExpectedReturnAt(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm font-normal"><option value="">Select date</option><option value={new Date(Date.now() + 86400000).toISOString()}>{new Date(Date.now() + 86400000).toLocaleDateString()} · Tomorrow</option><option value={new Date(Date.now() + 7 * 86400000).toISOString()}>{new Date(Date.now() + 7 * 86400000).toLocaleDateString()} · One week</option></select></label></div><div className="space-y-3 border-t border-ink-100 pt-4"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-ink-900">Items in this checkout</h2><button type="button" onClick={() => setItems((current) => [...current, { inventoryItemId: "", quantity: 1 }])} className="text-xs font-semibold text-brand-700">+ Add another item</button></div>{items.map((item, index) => <div key={index} className="flex flex-col gap-3 sm:flex-row"><select required value={item.inventoryItemId} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, inventoryItemId: event.target.value } : row))} className="h-10 min-w-0 flex-1 rounded-lg border border-ink-200 bg-white px-3 text-sm"><option value="">Select tool or equipment</option>{inventory.filter((candidate) => candidate.category !== "consumable" && candidate.quantityOnHand > 0).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name} · {candidate.quantityOnHand} available</option>)}</select><input required type="number" min="1" value={item.quantity} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, quantity: Number(event.target.value) } : row))} className="h-10 w-full rounded-lg border border-ink-200 px-3 text-sm sm:w-28" aria-label="Quantity" />{items.length > 1 && <button type="button" onClick={() => setItems((current) => current.filter((_, rowIndex) => rowIndex !== index))} className="h-10 px-3 text-sm font-semibold text-danger-600">Remove</button>}</div>)}</div><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional handoff notes" className="min-h-20 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500" /><div className="flex justify-end gap-3"><button type="button" onClick={resetForm} className="h-10 rounded-lg border border-ink-200 px-4 text-sm font-semibold text-ink-700">Cancel</button><button disabled={createCheckout.isPending} type="submit" className="h-10 rounded-lg bg-ink-950 px-5 text-sm font-semibold text-white disabled:opacity-50">{createCheckout.isPending ? "Creating..." : "Create checkout"}</button></div></form>}
    <div className="overflow-hidden border border-ink-200 bg-white"><div className="grid grid-cols-[1.3fr_1.1fr_1fr_1fr] gap-4 border-b border-ink-200 bg-ink-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500"><span>Borrower</span><span>Items</span><span>Project</span><span>Due</span></div>{isLoading ? <p className="p-5 text-sm text-ink-500">Loading checkouts...</p> : checkouts.length === 0 ? <p className="p-5 text-sm text-ink-500">No active checkouts.</p> : checkouts.map((checkout) => { const overdue = new Date(checkout.expectedReturnAt) < new Date(); return <div key={checkout.id} className="grid grid-cols-[1.3fr_1.1fr_1fr_1fr] gap-4 border-b border-ink-100 px-5 py-4 text-sm last:border-0"><div><p className="font-semibold text-ink-900">{checkout.borrower.name}</p><p className="mt-1 text-xs text-ink-500">{checkout.borrower.email}</p></div><span className="text-ink-700">{checkout.items.map((item) => `${item.inventoryItem.name} ×${item.quantity}`).join(", ")}</span><span className="text-ink-700">{checkout.project?.name || "Unassigned"}</span><span className={overdue ? "font-semibold text-danger-600" : "text-ink-700"}>{new Date(checkout.expectedReturnAt).toLocaleDateString()}</span></div>; })}</div></section>;
}