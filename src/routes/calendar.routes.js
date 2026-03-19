import { Router } from "express"
import { getCalendarEvents, getBookedDates, checkAvailability } from "../controllers/calendar.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(authMiddleware)

router.get("/events", getCalendarEvents)
router.get("/booked-dates", getBookedDates)
router.get("/availability", checkAvailability)

export default router
