export type InventoryCategory = "consumable" | "tool" | "equipment";

export interface InventoryItem {
  id: string;
  name: string;
  specification: string;
  description?: string | null;
  category: InventoryCategory;
  quantityOnHand: number;
  reorderPoint: number;
  sku?: string | null;
  referenceDocumentUrl?: string | null;
  site?: { id: string; name: string } | null;
  equipmentAsset?: {
    serialNumber?: string | null;
    condition: string;
    calibrationDueAt?: string | null;
  } | null;
}

export interface EngineeringDashboard {
  inventoryCount: number;
  lowStock: InventoryItem[];
  activeProjects: number;
  openCheckouts: number;
  overdueCheckouts: number;
}

export interface EngineeringProject {
  id: string;
  name: string;
  code?: string | null;
  status: string;
  site?: { name: string } | null;
  allocations: Array<{ quantity: number; inventoryItem: { name: string } }>;
}

export interface EngineeringCheckout {
  id: string;
  status: string;
  expectedReturnAt: string;
  borrower: { name: string; email: string };
  project?: { name: string } | null;
  items: Array<{ quantity: number; inventoryItem: { name: string } }>;
}

export interface EngineeringTeamMember {
  id: string;
  name: string;
  email: string;
}

export interface EngineeringSite {
  id: string;
  name: string;
  code?: string | null;
}