import { Router } from "express";
import {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
} from "../controller/equipment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getEquipment);
router.get("/:id", getEquipmentById);
router.post("/", createEquipment);
router.put("/:id", updateEquipment);
router.delete("/:id", deleteEquipment);

export default router;
