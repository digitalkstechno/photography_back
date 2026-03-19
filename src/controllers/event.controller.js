import { eventService } from "../services/event.service.js"

export const getEvents = async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.status) filter.status = req.query.status.toUpperCase()
    if (req.query.customer) filter.customer = req.query.customer
    const data = await eventService.findAll(filter)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getEventById = async (req, res, next) => {
  try {
    const data = await eventService.findById(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: "Event not found" })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const createEvent = async (req, res, next) => {
  try {
    const data = await eventService.create(req.body)
    res.status(201).json({ success: true, data, message: "Event created" })
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).json({ success: false, message: err.message, conflict: true })
    }
    next(err)
  }
}

export const updateEvent = async (req, res, next) => {
  try {
    const data = await eventService.update(req.params.id, req.body)
    res.json({ success: true, data, message: "Event updated" })
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).json({ success: false, message: err.message, conflict: true })
    }
    next(err)
  }
}

export const updateEventStatus = async (req, res, next) => {
  try {
    const data = await eventService.updateStatus(req.params.id, req.body.status)
    res.json({ success: true, data, message: "Event status updated" })
  } catch (err) {
    next(err)
  }
}

export const deleteEvent = async (req, res, next) => {
  try {
    await eventService.remove(req.params.id)
    res.json({ success: true, message: "Event deleted" })
  } catch (err) {
    next(err)
  }
}

export const checkAvailability = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate and endDate are required" })
    }
    const data = await eventService.checkAvailability(startDate, endDate)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
