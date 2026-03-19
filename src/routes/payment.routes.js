import { Router } from "express"
import {
  getPayments, getPaymentById, getPaymentsByParty, createPayment, updatePayment, deletePayment, getPaymentSummary
} from "../controllers/payment.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { authorizeRoles } from "../middlewares/role.middleware.js"

const router = Router()

router.use(authMiddleware)

router.get("/", getPayments)
router.get("/summary", getPaymentSummary)
router.get("/party/:partyId", getPaymentsByParty)
router.get("/:id", getPaymentById)
router.post("/", authorizeRoles("ADMIN", "STAFF"), createPayment)
router.put("/:id", authorizeRoles("ADMIN"), updatePayment)
router.delete("/:id", authorizeRoles("ADMIN"), deletePayment)

export default router