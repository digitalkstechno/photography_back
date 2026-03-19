import { Router } from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { getSummary } from "../controllers/dashboard.controller.js"

const router = Router()

router.use(authMiddleware)

router.get("/summary", getSummary)

export default router
