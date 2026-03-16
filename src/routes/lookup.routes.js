import { Router } from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js"

import {
  getPartyTypes,
  getUnits, createUnit, updateUnit, deleteUnit,
  getCategories, createCategory, updateCategory, deleteCategory,
  getTags, createTag, updateTag, deleteTag,
  getPaymentMethods,
  getTransactionTypes,
  getTransactionStatuses
} from "../controller/lookup.controller.js"

const router = Router()

router.use(authMiddleware)

// Party Types (read-only)
router.get("/party-types", getPartyTypes)

// Units
router.get("/units", getUnits)
router.post("/units", createUnit)
router.put("/units/:id", updateUnit)
router.delete("/units/:id", deleteUnit)

// Item Categories
router.get("/categories", getCategories)
router.post("/categories", createCategory)
router.put("/categories/:id", updateCategory)
router.delete("/categories/:id", deleteCategory)

// Tags
router.get("/tags", getTags)
router.post("/tags", createTag)
router.put("/tags/:id", updateTag)
router.delete("/tags/:id", deleteTag)

// Payment Methods (read-only)
router.get("/payment-methods", getPaymentMethods)

// Transaction Types (read-only)
router.get("/transaction-types", getTransactionTypes)

// Transaction Statuses (read-only)
router.get("/transaction-statuses", getTransactionStatuses)

export default router
