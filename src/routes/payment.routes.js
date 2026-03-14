import { Router } from "express"

import {
  getPayments,
  getPaymentById,
  createPayment,
  deletePayment
} from "../controller/payment.controller.js"

import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

// protect all routes
router.use(authMiddleware)

router.get("/", getPayments)
router.get("/:id", getPaymentById)
router.post("/", createPayment)
router.delete("/:id", deletePayment)

export default router