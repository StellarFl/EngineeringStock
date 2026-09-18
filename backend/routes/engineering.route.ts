import { Router } from "express";
import { requireAuth } from "../middleware/require-auth.middleware";
import multer from "multer";
import {
  getCheckouts,
  getDashboard,
  getInventory,
  getProjects,
  getTeamMembers,
  postProject,
  postProjectAllocation,
  getSites,
  getFieldVisits,
  postFieldVisit,
  postFieldPhoto,
  uploadFieldGallery,
  postCheckout,
  postInventory,
} from "../controllers/engineering.controller";

const router = Router();
router.use(requireAuth);
router.get("/dashboard", getDashboard);
router.get("/inventory", getInventory);
router.post("/inventory", postInventory);
router.get("/sites", getSites);
router.get("/projects", getProjects);
router.post("/projects", postProject);
router.post("/project-allocations", postProjectAllocation);
router.get("/team-members", getTeamMembers);
router.get("/checkouts", getCheckouts);
router.post("/checkouts", postCheckout);
router.get("/field-visits", getFieldVisits);
router.post("/field-visits", postFieldVisit);
router.post("/field-photos", postFieldPhoto);
router.post("/field-gallery", multer({ storage: multer.memoryStorage(), limits: { files: 20, fileSize: 4 * 1024 * 1024 } }).array("images", 20), uploadFieldGallery);

export default router;