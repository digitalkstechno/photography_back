import { Router } from "express"
import * as bookingController from "../controller/booking.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

router.get("/", authMiddleware, bookingController.getBookings)
router.get("/:id", authMiddleware, bookingController.getBookingById)
router.post("/", authMiddleware, bookingController.createBooking)
router.put("/:id", authMiddleware, bookingController.updateBooking)

// Convert quote to booking
router.post("/convert/:quotationId", authMiddleware, bookingController.convertQuotationToBooking)

// Update status
router.put("/:id/status", authMiddleware, bookingController.updateBookingStatus)

router.delete("/:id", authMiddleware, bookingController.deleteBooking)

export default router
