import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/require-auth.middleware";
import {
  createCheckout,
  createInventoryItem,
  getEngineeringDashboard,
  listCheckouts,
  listInventory,
  listProjects,
  listTeamMembers,
  createProject,
  createProjectAllocation,
  listSites,
  listFieldVisits,
  createFieldVisit,
  addFieldPhoto,
  uploadFieldPhotos,
} from "../services/engineering.service";

const businessId = (req: Request) => (req as AuthenticatedRequest).auth!.businessId;
const userId = (req: Request) => (req as AuthenticatedRequest).auth!.id;

export const getInventory = async (req: Request, res: Response) => {
  const data = await listInventory(businessId(req), typeof req.query.q === "string" ? req.query.q : undefined);
  return res.json({ status: 200, data });
};

export const postInventory = async (req: Request, res: Response) => {
  try {
    const data = await createInventoryItem(businessId(req), req.body);
    return res.status(201).json({ status: 201, data });
  } catch (error: any) {
    return res.status(error.code === "P2002" ? 409 : 400).json({ message: error.message ?? "Unable to create inventory item" });
  }
};

export const getSites = async (req: Request, res: Response) => res.json({ status: 200, data: await listSites(businessId(req)) });
export const getProjects = async (req: Request, res: Response) => res.json({ status: 200, data: await listProjects(businessId(req)) });
export const postProject = async (req: Request, res: Response) => {
  try {
    return res.status(201).json({ status: 201, data: await createProject(businessId(req), userId(req), req.body) });
  } catch (error: any) {
    return res.status(error.code === "P2002" ? 409 : 400).json({ message: error.message ?? "Unable to create project" });
  }
};
export const postProjectAllocation = async (req: Request, res: Response) => {
  try {
    return res.status(201).json({ status: 201, data: await createProjectAllocation(businessId(req), req.body) });
  } catch (error: any) {
    return res.status(error.code === "P2002" ? 409 : 400).json({ message: error.message ?? "Unable to allocate inventory" });
  }
};
export const getTeamMembers = async (req: Request, res: Response) => res.json({ status: 200, data: await listTeamMembers(businessId(req)) });
export const getCheckouts = async (req: Request, res: Response) => res.json({ status: 200, data: await listCheckouts(businessId(req)) });
export const getDashboard = async (req: Request, res: Response) => res.json({ status: 200, data: await getEngineeringDashboard(businessId(req)) });
export const getFieldVisits = async (req: Request, res: Response) => res.json({ status: 200, data: await listFieldVisits(businessId(req)) });
export const postFieldVisit = async (req: Request, res: Response) => res.status(201).json({ status: 201, data: await createFieldVisit(businessId(req), userId(req), req.body) });
export const postFieldPhoto = async (req: Request, res: Response) => res.status(201).json({ status: 201, data: await addFieldPhoto(businessId(req), req.body) });
export const uploadFieldGallery = async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (!files.length) return res.status(400).json({ message: "At least one image is required" });
  try {
    const data = await uploadFieldPhotos(businessId(req), userId(req), {
      files: files.map((file) => ({ buffer: file.buffer, originalname: file.originalname, mimetype: file.mimetype })),
      location: String(req.body.location ?? ""),
      category: String(req.body.category ?? "other"),
      note: req.body.note ? String(req.body.note) : undefined,
    });
    return res.status(201).json({ status: 201, data });
  } catch (error: any) {
    return res.status(502).json({ message: error.message ?? "Image upload failed" });
  }
};

export const postCheckout = async (req: Request, res: Response) => {
  try {
    const data = await createCheckout(businessId(req), userId(req), req.body);
    return res.status(201).json({ status: 201, data });
  } catch (error: any) {
    return res.status(400).json({ message: error.message ?? "Unable to create checkout" });
  }
};