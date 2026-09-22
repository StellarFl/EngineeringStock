import { api } from "./client";
import type {
  EngineeringCheckout,
  EngineeringDashboard,
  EngineeringProject,
  InventoryItem,
  EngineeringTeamMember,
  EngineeringSite,
} from "@/types/engineering";
import type { ApiResponse } from "@/types/api";

export const getEngineeringDashboard = async () =>
  (await api.get<ApiResponse<EngineeringDashboard>>("/engineering/dashboard")).data;

export const getEngineeringInventory = async (query = "") =>
  (await api.get<ApiResponse<InventoryItem[]>>("/engineering/inventory", { params: { q: query || undefined } })).data;

export const createEngineeringInventory = async (input: Partial<InventoryItem>) =>
  (await api.post<ApiResponse<InventoryItem>>("/engineering/inventory", input)).data;

export const getEngineeringProjects = async () =>
  (await api.get<ApiResponse<EngineeringProject[]>>("/engineering/projects")).data;

export const getEngineeringSites = async () =>
  (await api.get<ApiResponse<EngineeringSite[]>>("/engineering/sites")).data;

export const createEngineeringProject = async (input: {
  name: string;
  code?: string;
  description?: string;
  customerName?: string;
  status?: string;
  siteId?: string;
  startDate?: string;
  endDate?: string;
}) => (await api.post<ApiResponse<EngineeringProject>>("/engineering/projects", input)).data;

export const createProjectAllocation = async (input: {
  projectId: string;
  inventoryItemId: string;
  quantity: number;
}) => (await api.post("/engineering/project-allocations", input)).data;

export const getEngineeringTeamMembers = async () =>
  (await api.get<ApiResponse<EngineeringTeamMember[]>>("/engineering/team-members")).data;

export const createEngineeringCheckout = async (input: {
  borrowerId: string;
  projectId?: string;
  expectedReturnAt: string;
  notes?: string;
  items: Array<{ inventoryItemId: string; quantity: number }>;
}) => (await api.post("/engineering/checkouts", input)).data;

export const getEngineeringCheckouts = async () =>
  (await api.get<ApiResponse<EngineeringCheckout[]>>("/engineering/checkouts")).data;

export interface FieldGalleryPhoto {
  id: string;
  storageUrl: string;
  originalName: string;
  issueType?: string | null;
  notes?: string | null;
  capturedAt?: string | null;
  site?: { name: string } | null;
  addedBy?: { name: string } | null;
}

export const getFieldGallery = async () =>
  (await api.get<ApiResponse<Array<{ engineer?: { name: string } | null; photos: FieldGalleryPhoto[] }>>>("/engineering/field-visits")).data;

export const uploadFieldGallery = async (input: {
  files: File[];
  category: string;
  location: string;
  note?: string;
}) => {
  const formData = new FormData();
  input.files.forEach((file) => formData.append("images", file));
  formData.append("category", input.category);
  formData.append("location", input.location);
  if (input.note) formData.append("note", input.note);
  return (await api.post("/engineering/field-gallery", formData)).data;
};