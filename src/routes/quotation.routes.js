import { Router } from "express"
import {
  getQuotations, getQuotationById, createQuotation, updateQuotation, deleteQuotation, sendQuotation
} from "../controllers/quotation.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { authorizeRoles } from "../middlewares/role.middleware.js"

const router = Router()

router.use(authMiddleware)

router.get("/", getQuotations)
router.get("/:id", getQuotationById)
router.post("/", authorizeRoles("ADMIN", "STAFF"), createQuotation)
router.put("/:id", authorizeRoles("ADMIN", "STAFF"), updateQuotation)
router.delete("/:id", authorizeRoles("ADMIN"), deleteQuotation)
router.patch("/:id/send", authorizeRoles("ADMIN", "STAFF"), sendQuotation)

export default router
