import { reportsService } from "../services/reports.service.js"

export const getAnalytics = async (req, res, next) => {
  try {
    const data = await reportsService.getAnalyticsSummary()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getRevenueReport = async (req, res, next) => {
  try {
    const data = await reportsService.getRevenueReport()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getOutstandingReceivables = async (req, res, next) => {
  try {
    const data = await reportsService.getOutstandingReceivables()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getConversionAnalytics = async (req, res, next) => {
  try {
    const data = await reportsService.getConversionAnalytics()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getJobProfitability = async (req, res, next) => {
  try {
    const data = await reportsService.getJobProfitability()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getExpenseAudit = async (req, res, next) => {
  try {
    const data = await reportsService.getExpenseAudit()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
