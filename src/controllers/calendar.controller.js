import { calendarService } from "../services/calendar.service.js"

export const getCalendarEvents = async (req, res, next) => {
  try {
    const { start, end } = req.query
    if (!start || !end) {
      return res.status(400).json({ success: false, message: "start and end query parameters are required" })
    }
    const data = await calendarService.getEventsByRange(start, end)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getBookedDates = async (req, res, next) => {
  try {
    const { start, end } = req.query
    if (!start || !end) {
      return res.status(400).json({ success: false, message: "start and end query parameters are required" })
    }
    const data = await calendarService.getBookedDates(start, end)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const checkAvailability = async (req, res, next) => {
  try {
    const { start, end } = req.query
    if (!start || !end) {
      return res.status(400).json({ success: false, message: "start and end query parameters are required" })
    }
    const data = await calendarService.checkAvailability(start, end)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
