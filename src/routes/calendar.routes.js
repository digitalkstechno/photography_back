import { Router } from "express"
import * as calendarController from "../controller/calendar.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

// Unified route for all calendar-related events (shoot schedule + availability)
router.get("/events", authMiddleware, calendarController.getCalendarEvents)

export default router
