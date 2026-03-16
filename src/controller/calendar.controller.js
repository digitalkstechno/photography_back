import { calendarService } from "../services/calendar.service.js";

export const getCalendarEvents = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ message: "start and end query parameters are required." });
    }
    const data = await calendarService.getEvents(start, end);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
