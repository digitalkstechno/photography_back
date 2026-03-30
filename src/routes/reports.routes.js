import express from "express"
import * as reportsController from "../controllers/reports.controller.js"

const router = express.Router()

router.get("/summary", reportsController.getAnalytics)
router.get("/revenue", reportsController.getRevenueReport)
router.get("/receivables", reportsController.getOutstandingReceivables)
router.get("/conversion", reportsController.getConversionAnalytics)
router.get("/profitability", reportsController.getJobProfitability)
router.get("/expenses", reportsController.getExpenseAudit)

export default router
