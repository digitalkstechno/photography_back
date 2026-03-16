import { Router } from "express"

import authRoutes from "./auth.routes.js"
import userRoutes from "./user.routes.js"
import partyRoutes from "./party.routes.js"
import itemRoutes from "./item.routes.js"
import packageRoutes from "./package.routes.js"
import equipmentRoutes from "./equipment.routes.js"
import availabilityRoutes from "./availability.routes.js"
import ledgerRoutes from "./ledger.routes.js"
import transactionRoutes from "./transaction.routes.js"
import paymentRoutes from "./payment.routes.js"
import lookupRoutes from "./lookup.routes.js"
import dashboardRoutes from "./dashboard.routes.js"
import bookingRoutes from "./booking.routes.js"
import calendarRoutes from "./calendar.routes.js"

const router = Router()

router.use("/auth", authRoutes)
router.use("/users", userRoutes)
router.use("/parties", partyRoutes)
router.use("/items", itemRoutes)
router.use("/packages", packageRoutes)
router.use("/equipment", equipmentRoutes)
router.use("/availability", availabilityRoutes)
router.use("/ledger", ledgerRoutes)
router.use("/transactions", transactionRoutes)
router.use("/payments", paymentRoutes)
router.use("/lookups", lookupRoutes)
router.use("/dashboard", dashboardRoutes)
router.use("/bookings", bookingRoutes)
router.use("/calendar", calendarRoutes)

export default router