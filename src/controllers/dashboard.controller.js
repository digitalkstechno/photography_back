import { dashboardService } from "../services/dashboard.service.js"

export const getSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummary()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
