import { Router } from "express";
import {
  getAvailabilities,
  getAvailabilityById,
  createAvailability,
  updateAvailability,
  deleteAvailability
} from "../controller/availability.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getAvailabilities);
router.get("/:id", getAvailabilityById);
router.post("/", createAvailability);
router.put("/:id", updateAvailability);
router.delete("/:id", deleteAvailability);

export default router;
