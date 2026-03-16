import { Router } from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js"

import {
  getSummary,
  getRecentTransactions
} from "../controller/dashboard.controller.js"

const router = Router()

router.use(authMiddleware)

router.get("/summary", getSummary)
router.get("/recent-transactions", getRecentTransactions)

export default router
