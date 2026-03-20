import { Router } from "express"
import { getFreelancers, getFreelancerById, createFreelancer, updateFreelancer, deleteFreelancer, getAvailability } from "../controllers/freelancer.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { authorizeRoles } from "../middlewares/role.middleware.js"

const router = Router()

router.use(authMiddleware)

router.get("/", getFreelancers)
router.get("/availability", getAvailability)   // ← must be before /:id
router.get("/:id", getFreelancerById)
router.post("/", authorizeRoles("ADMIN", "STAFF"), createFreelancer)
router.put("/:id", authorizeRoles("ADMIN", "STAFF"), updateFreelancer)
router.delete("/:id", authorizeRoles("ADMIN"), deleteFreelancer)

export default router
