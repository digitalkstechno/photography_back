import { dashboardService } from "../services/dashboard.service.js"

export const getSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummary()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const getRecentTransactions = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50)
    const data = await dashboardService.getRecentTransactions(limit)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
