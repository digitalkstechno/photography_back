import { Router } from "express"
import { getPackages, getPackageById, createPackage, updatePackage, deletePackage } from "../controllers/package.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { authorizeRoles } from "../middlewares/role.middleware.js"

const router = Router()

router.use(authMiddleware)

router.get("/", getPackages)
router.get("/:id", getPackageById)
router.post("/", authorizeRoles("ADMIN", "STAFF"), createPackage)
router.put("/:id", authorizeRoles("ADMIN", "STAFF"), updatePackage)
router.delete("/:id", authorizeRoles("ADMIN"), deletePackage)

export default router
