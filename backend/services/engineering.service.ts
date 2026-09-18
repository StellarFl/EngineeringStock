import { prisma } from "../database/prisma";
import { Prisma } from "../generated/prisma/client";
import { uploadImage } from "../config/cloudinary";

export const listInventory = async (businessId: string, query?: string) => {
  const search = query?.trim();
  return prisma.inventoryItem.findMany({
    where: {
      businessId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { specification: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { site: true, equipmentAsset: true },
    orderBy: { updatedAt: "desc" },
  });
};

export const createInventoryItem = async (businessId: string, data: {
  name: string;
  specification: string;
  category: "consumable" | "tool" | "equipment";
  quantityOnHand?: number;
  reorderPoint?: number;
  description?: string;
  sku?: string;
  referenceDocumentUrl?: string;
  supplierName?: string;
  supplierEmail?: string;
  siteId?: string;
  serialNumber?: string;
  condition?: "new" | "good" | "needs_repair" | "retired";
  calibrationDueAt?: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.create({
      data: {
        businessId,
        name: data.name,
        specification: data.specification,
        category: data.category,
        quantityOnHand: data.quantityOnHand ?? 0,
        reorderPoint: data.reorderPoint ?? 0,
        description: data.description,
        sku: data.sku,
        referenceDocumentUrl: data.referenceDocumentUrl,
        supplierName: data.supplierName,
        supplierEmail: data.supplierEmail,
        siteId: data.siteId,
      },
    });

    if (data.category !== "consumable" && (data.serialNumber || data.condition || data.calibrationDueAt)) {
      await tx.equipmentAsset.create({
        data: {
          inventoryItemId: item.id,
          serialNumber: data.serialNumber,
          condition: data.condition,
          calibrationDueAt: data.calibrationDueAt ? new Date(data.calibrationDueAt) : undefined,
        },
      });
    }

    return tx.inventoryItem.findUniqueOrThrow({
      where: { id: item.id },
      include: { site: true, equipmentAsset: true },
    });
  });
};

export const listSites = (businessId: string) => prisma.site.findMany({
  where: { businessId },
  orderBy: { name: "asc" },
});

export const listProjects = (businessId: string) => prisma.project.findMany({
  where: { businessId },
  include: { site: true, allocations: { include: { inventoryItem: true } } },
  orderBy: { updatedAt: "desc" },
});

export const createProject = async (businessId: string, createdById: string, data: {
  name: string;
  code?: string;
  description?: string;
  customerName?: string;
  status?: "planned" | "active" | "on_hold" | "completed" | "cancelled";
  siteId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  if (data.siteId) {
    const site = await prisma.site.findFirst({ where: { id: data.siteId, businessId } });
    if (!site) throw new Error("Site not found");
  }
  return prisma.project.create({
    data: {
      businessId,
      createdById,
      name: data.name.trim(),
      code: data.code?.trim() || undefined,
      description: data.description?.trim() || undefined,
      customerName: data.customerName?.trim() || undefined,
      status: data.status ?? "planned",
      siteId: data.siteId,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
    include: { site: true, allocations: { include: { inventoryItem: true } } },
  });
};

export const createProjectAllocation = async (businessId: string, data: {
  projectId: string;
  inventoryItemId: string;
  quantity: number;
}) => {
  if (!Number.isInteger(data.quantity) || data.quantity < 1) throw new Error("Allocation quantity must be at least 1");
  const [project, inventoryItem] = await Promise.all([
    prisma.project.findFirst({ where: { id: data.projectId, businessId } }),
    prisma.inventoryItem.findFirst({ where: { id: data.inventoryItemId, businessId } }),
  ]);
  if (!project) throw new Error("Project not found");
  if (!inventoryItem) throw new Error("Inventory item not found");
  if (data.quantity > inventoryItem.quantityOnHand) throw new Error(`Only ${inventoryItem.quantityOnHand} units of ${inventoryItem.name} are available`);

  const existing = await prisma.projectAllocation.findFirst({
    where: { projectId: data.projectId, inventoryItemId: data.inventoryItemId, checkoutItemId: null },
  });
  return existing
    ? prisma.projectAllocation.update({
        where: { id: existing.id },
        data: { quantity: { increment: data.quantity } },
        include: { inventoryItem: true },
      })
    : prisma.projectAllocation.create({
        data: { projectId: data.projectId, inventoryItemId: data.inventoryItemId, quantity: data.quantity },
        include: { inventoryItem: true },
      });
};

export const listTeamMembers = (businessId: string) => prisma.user.findMany({
  where: { deletedAt: null, memberships: { some: { businessId } } },
  select: { id: true, name: true, email: true },
  orderBy: { name: "asc" },
});

export const listCheckouts = (businessId: string) => prisma.checkout.findMany({
  where: { businessId, status: { in: ["open", "partially_returned", "overdue"] } },
  include: {
    borrower: { select: { id: true, name: true, email: true } },
    project: { select: { id: true, name: true } },
    items: { include: { inventoryItem: true } },
  },
  orderBy: { expectedReturnAt: "asc" },
});

export const listFieldVisits = (businessId: string) => prisma.fieldVisit.findMany({
  where: { businessId },
  include: { site: true, project: true, engineer: { select: { id: true, name: true } }, photos: { include: { site: true } }, reports: true },
  orderBy: { createdAt: "desc" },
});

export const createFieldVisit = (businessId: string, engineerId: string, data: { title: string; siteId: string; projectId?: string; notes?: string }) => prisma.fieldVisit.create({
  data: { businessId, engineerId, title: data.title, siteId: data.siteId, projectId: data.projectId, notes: data.notes },
  include: { site: true, project: true },
});

export const addFieldPhoto = async (businessId: string, data: { fieldVisitId: string; storageUrl: string; originalName: string; mimeType: string; capturedAt?: string; latitude?: number; longitude?: number; issueType?: string; notes?: string; metadata?: unknown }) => {
  const visit = await prisma.fieldVisit.findFirst({ where: { id: data.fieldVisitId, businessId } });
  if (!visit) throw new Error("Field visit not found");
  return prisma.fieldPhoto.create({
    data: {
      fieldVisitId: data.fieldVisitId,
      storageUrl: data.storageUrl,
      originalName: data.originalName,
      mimeType: data.mimeType,
      capturedAt: data.capturedAt ? new Date(data.capturedAt) : undefined,
      latitude: data.latitude,
      longitude: data.longitude,
      issueType: data.issueType,
      notes: data.notes,
      metadata: data.metadata === undefined ? undefined : (data.metadata as Prisma.InputJsonValue),
    },
  });
};

export const createCheckout = async (businessId: string, createdById: string, data: {
  borrowerId: string;
  projectId?: string;
  expectedReturnAt: string;
  notes?: string;
  items: Array<{ inventoryItemId: string; quantity: number }>;
}) => prisma.$transaction(async (tx) => {
  const ids = data.items.map((item) => item.inventoryItemId);
  if (new Set(ids).size !== ids.length) throw new Error("Each inventory item may appear only once in a checkout");
  const inventory = await tx.inventoryItem.findMany({ where: { id: { in: ids }, businessId } });
  if (inventory.length !== ids.length) throw new Error("One or more inventory items were not found");

  for (const requested of data.items) {
    const item = inventory.find((candidate) => candidate.id === requested.inventoryItemId)!;
    if (requested.quantity < 1 || requested.quantity > item.quantityOnHand) {
      throw new Error(`Insufficient quantity available for ${item.name}`);
    }
  }

  const checkout = await tx.checkout.create({
    data: {
      businessId,
      createdById,
      borrowerId: data.borrowerId,
      projectId: data.projectId,
      expectedReturnAt: new Date(data.expectedReturnAt),
      notes: data.notes,
      items: { create: data.items },
    },
    include: { items: true },
  });

  for (const requested of data.items) {
    const item = inventory.find((candidate) => candidate.id === requested.inventoryItemId)!;
    await tx.inventoryItem.update({
      where: { id: item.id },
      data: { quantityOnHand: { decrement: requested.quantity } },
    });
    await tx.stockMovement.create({
      data: {
        businessId,
        inventoryItemId: item.id,
        performedById: createdById,
        projectId: data.projectId,
        type: item.category === "consumable" ? "consumption" : "adjustment",
        quantity: -requested.quantity,
        reason: `Checkout ${checkout.id}`,
      },
    });
  }

  return checkout;
});

export const getEngineeringDashboard = async (businessId: string) => {
  const now = new Date();
  const [inventoryCount, inventory, activeProjects, openCheckouts, overdueCheckouts] = await Promise.all([
    prisma.inventoryItem.count({ where: { businessId } }),
    prisma.inventoryItem.findMany({ where: { businessId }, orderBy: { quantityOnHand: "asc" }, take: 100 }),
    prisma.project.count({ where: { businessId, status: "active" } }),
    prisma.checkout.count({ where: { businessId, status: { in: ["open", "partially_returned"] } } }),
    prisma.checkout.count({ where: { businessId, status: { in: ["open", "partially_returned"], }, expectedReturnAt: { lt: now } } }),
  ]);
  return { inventoryCount, lowStock: inventory.filter((item) => item.quantityOnHand <= item.reorderPoint).slice(0, 8), activeProjects, openCheckouts, overdueCheckouts };
};

export const uploadFieldPhotos = async (businessId: string, engineerId: string, data: {
  files: Array<{ buffer: Buffer; originalname: string; mimetype: string }>;
  location: string;
  category: string;
  note?: string;
}) => {
  const location = data.location.trim();
  if (!location) throw new Error("A site or location is required");

  const site = await prisma.site.upsert({
    where: { businessId_name: { businessId, name: location } },
    update: {},
    create: { businessId, name: location },
  });
  const visit = await prisma.fieldVisit.create({
    data: {
      businessId,
      engineerId,
      siteId: site.id,
      title: `Gallery upload - ${location}`,
      status: "in_progress",
      notes: data.note,
    },
  });

  const photos = [];
  try {
    for (const file of data.files) {
      const uploaded = await uploadImage(file.buffer, file.originalname);
      photos.push(await prisma.fieldPhoto.create({
        data: {
          fieldVisitId: visit.id,
          siteId: site.id,
          storageUrl: uploaded.secure_url,
          originalName: file.originalname,
          mimeType: file.mimetype,
          issueType: data.category,
          notes: data.note,
          capturedAt: new Date(),
          metadata: { cloudinaryPublicId: uploaded.public_id },
        },
      }));
    }
  } catch (error) {
    await prisma.fieldVisit.delete({ where: { id: visit.id } });
    throw error;
  }

  return { visit, site, photos };
};