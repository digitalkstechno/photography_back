import { Router } from "express"

import authRoutes from "./auth.routes.js"
import partyRoutes from "./party.routes.js"
import itemRoutes from "./item.routes.js"
import transactionRoutes from "./transaction.routes.js"
import paymentRoutes from "./payment.routes.js"
import lookupRoutes from "./lookup.routes.js"
import dashboardRoutes from "./dashboard.routes.js"

const router = Router()

router.use("/auth", authRoutes)
router.use("/parties", partyRoutes)
router.use("/items", itemRoutes)
router.use("/transactions", transactionRoutes)
router.use("/payments", paymentRoutes)
router.use("/lookups", lookupRoutes)
router.use("/dashboard", dashboardRoutes)

export default router