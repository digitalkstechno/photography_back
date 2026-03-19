import { Router } from "express"
import { getJobs, getJobById, getJobsByEvent, createJob, updateJob, deleteJob } from "../controllers/job.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { authorizeRoles } from "../middlewares/role.middleware.js"

const router = Router()

router.use(authMiddleware)

router.get("/", getJobs)
router.get("/event/:eventId", getJobsByEvent)
router.get("/:id", getJobById)
router.post("/", authorizeRoles("ADMIN", "STAFF"), createJob)
router.put("/:id", authorizeRoles("ADMIN", "STAFF"), updateJob)
router.delete("/:id", authorizeRoles("ADMIN"), deleteJob)

export default router
