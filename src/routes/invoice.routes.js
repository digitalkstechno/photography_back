import { Router } from "express"
import {
  getInvoices, getInvoiceById, createInvoice, createFromQuotation, updateInvoice, deleteInvoice
} from "../controllers/invoice.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { authorizeRoles } from "../middlewares/role.middleware.js"

const router = Router()

router.use(authMiddleware)

router.get("/", getInvoices)
router.get("/:id", getInvoiceById)
router.post("/", authorizeRoles("ADMIN", "STAFF"), createInvoice)
router.post("/from-quotation/:quotationId", authorizeRoles("ADMIN", "STAFF"), createFromQuotation)
router.put("/:id", authorizeRoles("ADMIN", "STAFF"), updateInvoice)
router.delete("/:id", authorizeRoles("ADMIN"), deleteInvoice)

export default router
