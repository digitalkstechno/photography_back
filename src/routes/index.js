import { Router } from "express"

import authRoutes from "./auth.routes.js"
import partyRoutes from "./party.routes.js"
import serviceRoutes from "./service.routes.js"
import packageRoutes from "./package.routes.js"
import quotationRoutes from "./quotation.routes.js"
import invoiceRoutes from "./invoice.routes.js"
import eventRoutes from "./event.routes.js"
import jobRoutes from "./job.routes.js"
import freelancerRoutes from "./freelancer.routes.js"
import paymentRoutes from "./payment.routes.js"
import ledgerRoutes from "./ledger.routes.js"
import calendarRoutes from "./calendar.routes.js"
import dashboardRoutes from "./dashboard.routes.js"

const router = Router()

router.use("/auth", authRoutes)
router.use("/parties", partyRoutes)
router.use("/services", serviceRoutes)
router.use("/packages", packageRoutes)
router.use("/quotations", quotationRoutes)
router.use("/invoices", invoiceRoutes)
router.use("/events", eventRoutes)
router.use("/jobs", jobRoutes)
router.use("/freelancers", freelancerRoutes)
router.use("/payments", paymentRoutes)
router.use("/ledger", ledgerRoutes)
router.use("/calendar", calendarRoutes)
router.use("/dashboard", dashboardRoutes)

export default router