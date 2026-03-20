import { Router } from "express"
import {
  getEvents, getEventById, createEvent, updateEvent, updateEventStatus, deleteEvent, getTeamAvailability
} from "../controllers/event.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { authorizeRoles } from "../middlewares/role.middleware.js"

const router = Router()

router.use(authMiddleware)

router.get("/", getEvents)
router.get("/availability/team", getTeamAvailability)
router.get("/:id", getEventById)
router.post("/", authorizeRoles("ADMIN", "STAFF"), createEvent)
router.put("/:id", authorizeRoles("ADMIN", "STAFF"), updateEvent)
router.patch("/:id/status", authorizeRoles("ADMIN", "STAFF"), updateEventStatus)
router.delete("/:id", authorizeRoles("ADMIN"), deleteEvent)

export default router
