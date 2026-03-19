import { Router } from "express"
import {
  getServices, getServiceById, getServicesByType, createService, updateService, deleteService
} from "../controllers/service.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { authorizeRoles } from "../middlewares/role.middleware.js"

const router = Router()

router.use(authMiddleware)

router.get("/", getServices)
router.get("/type/:type", getServicesByType)
router.get("/:id", getServiceById)
router.post("/", authorizeRoles("ADMIN", "STAFF"), createService)
router.put("/:id", authorizeRoles("ADMIN", "STAFF"), updateService)
router.delete("/:id", authorizeRoles("ADMIN"), deleteService)

export default router
