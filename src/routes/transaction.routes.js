import { Router } from "express"

import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createQuotation,
  createSalesInvoice,
  createPurchaseInvoice,
  convertQuotationToInvoice,
  getSalesQuotations,
  getSalesInvoices,
  getPurchaseInvoices
} from "../controllers/transaction.controller.js"

import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

// protect all routes
router.use(authMiddleware)

router.get("/", getTransactions)
router.get("/sales/quotations", getSalesQuotations)
router.get("/sales/invoices", getSalesInvoices)
router.get("/purchases/invoices", getPurchaseInvoices)
router.get("/:id", getTransactionById)
router.post("/", createTransaction)
router.post("/sales/quotations", createQuotation)
router.post("/sales/invoices", createSalesInvoice)
router.post("/purchases/invoices", createPurchaseInvoice)
router.post("/:id/convert-to-invoice", convertQuotationToInvoice)
router.put("/:id", updateTransaction)
router.delete("/:id", deleteTransaction)

export default router