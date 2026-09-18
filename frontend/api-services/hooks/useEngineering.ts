import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createEngineeringInventory,
  getEngineeringCheckouts,
  getEngineeringDashboard,
  getEngineeringInventory,
  getEngineeringProjects,
  getEngineeringTeamMembers,
  createEngineeringCheckout,
  getEngineeringSites,
  createEngineeringProject,
  createProjectAllocation,
} from "../services/engineering.service";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { InventoryItem } from "@/types/engineering";

export const useEngineeringDashboard = () => useQuery({
  queryKey: ["engineering-dashboard"],
  queryFn: getEngineeringDashboard,
  select: (response) => response.data,
});

export const useEngineeringInventory = (query: string) => useQuery({
  queryKey: ["engineering-inventory", query],
  queryFn: () => getEngineeringInventory(query),
  select: (response) => response.data,
});

export const useCreateEngineeringInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEngineeringInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engineering-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["engineering-dashboard"] });
      toast.success("Inventory item added");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
};

export const useEngineeringProjects = () => useQuery({
  queryKey: ["engineering-projects"],
  queryFn: getEngineeringProjects,
  select: (response) => response.data,
});

export const useEngineeringSites = () => useQuery({
  queryKey: ["engineering-sites"],
  queryFn: getEngineeringSites,
  select: (response) => response.data,
});

export const useCreateEngineeringProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEngineeringProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["engineering-projects"] });
      toast.success("Project created");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
};

export const useCreateProjectAllocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProjectAllocation,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["engineering-projects"] }),
        queryClient.invalidateQueries({ queryKey: ["engineering-inventory"] }),
      ]);
      toast.success("Inventory allocated");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
};

export const useEngineeringTeamMembers = () => useQuery({
  queryKey: ["engineering-team-members"],
  queryFn: getEngineeringTeamMembers,
  select: (response) => response.data,
});

export const useCreateEngineeringCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEngineeringCheckout,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["engineering-checkouts"] }),
        queryClient.invalidateQueries({ queryKey: ["engineering-inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["engineering-dashboard"] }),
      ]);
      toast.success("Checkout created");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
};

export const useEngineeringCheckouts = () => useQuery({
  queryKey: ["engineering-checkouts"],
  queryFn: getEngineeringCheckouts,
  select: (response) => response.data,
});

export type EngineeringInventoryInput = Partial<InventoryItem> & {
  name: string;
  specification: string;
  category: "consumable" | "tool" | "equipment";
};