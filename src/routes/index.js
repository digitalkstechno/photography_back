import { Router } from "express"

import authRoutes from "./auth.routes.js"
import partyRoutes from "./party.routes.js"
import itemRoutes from "./item.routes.js"
import transactionRoutes from "./transaction.routes.js"
import paymentRoutes from "./payment.routes.js"

const router = Router()

router.use("/auth", authRoutes)
router.use("/parties", partyRoutes)
router.use("/items", itemRoutes)
router.use("/transactions", transactionRoutes)
router.use("/payments", paymentRoutes)

export default router