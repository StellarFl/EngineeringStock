import type { Metadata } from "next";
import { InventoryWorkspace } from "@/components/engineering/inventory-workspace";

export const metadata: Metadata = { title: "Inventory" };

export default function InventoryPage() {
  return <InventoryWorkspace />;
}