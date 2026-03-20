import { Router } from "express"
import { getEquipment, getEquipmentById, createEquipment, updateEquipment, deleteEquipment } from "../controllers/equipment.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { authorizeRoles } from "../middlewares/role.middleware.js"

const router = Router()

router.use(authMiddleware)

router.get("/", getEquipment)
router.get("/:id", getEquipmentById)
router.post("/", authorizeRoles("ADMIN", "STAFF"), createEquipment)
router.put("/:id", authorizeRoles("ADMIN", "STAFF"), updateEquipment)
router.delete("/:id", authorizeRoles("ADMIN"), deleteEquipment)

export default router
