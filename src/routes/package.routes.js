import { Router } from "express";
import {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage
} from "../controller/package.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getPackages);
router.get("/:id", getPackageById);
router.post("/", createPackage);
router.put("/:id", updatePackage);
router.delete("/:id", deletePackage);

export default router;
