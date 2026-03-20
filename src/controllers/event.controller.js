import { eventService } from "../services/event.service.js"
import Event from "../schemas/event.schema.js"
import User from "../schemas/user.schema.js"
import Freelancer from "../schemas/freelancer.schema.js"
import Equipment from "../schemas/equipment.schema.js"

export const getEvents = async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.status) filter.status = req.query.status.toUpperCase()
    if (req.query.customer) filter.customer = req.query.customer
    const data = await eventService.findAll({ ...filter, ...req.query })
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

export const getTeamAvailability = async (req, res, next) => {
  try {
    const { startDate, endDate, excludeEventId } = req.query
    if (!startDate || !endDate) return res.status(400).json({ success: false, message: "startDate and endDate are required" })

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Find all overlapping events
    const conflictQuery = {
      status: { $ne: "CANCELLED" },
      startDate: { $lte: end },
      endDate: { $gte: start }
    }
    if (excludeEventId && excludeEventId !== 'undefined' && excludeEventId !== 'null') {
      conflictQuery._id = { $ne: excludeEventId }
    }

    const overlappingEvents = await Event.find(conflictQuery)
      .select("_id title startDate endDate assignments")
      .lean()

    // Build conflict maps
    const busyUsers = new Map()
    const busyFreelancers = new Map()
    const busyEquipments = new Map()

    for (const ev of overlappingEvents) {
      const conflictInfo = { eventId: ev._id, eventTitle: ev.title || "Unnamed Event", startDate: ev.startDate, endDate: ev.endDate }
      for (const assign of (ev.assignments || [])) {
        if (assign.user) busyUsers.set(assign.user.toString(), conflictInfo)
        if (assign.freelancer) busyFreelancers.set(assign.freelancer.toString(), conflictInfo)
        for (const eq of (assign.equipments || [])) {
          busyEquipments.set(eq.toString(), conflictInfo)
        }
      }
    }

    // Fetch all active entities
    const allUsers = await User.find({ isActive: true }).select('name role email phone').lean()
    const allFreelancers = await Freelancer.find({ isActive: true }).select('name skill chargePerDay').lean()
    const allEquipments = await Equipment.find({ isActive: true }).select('name category serialNumber condition').lean()

    // Decorate with availability
    const mapWithAvailability = (list, map) => list.map(item => {
      const conflict = map.get(item._id.toString())
      return { ...item, isAvailable: !conflict, conflict: conflict || null }
    })

    res.json({
      success: true,
      data: {
        users: mapWithAvailability(allUsers, busyUsers),
        freelancers: mapWithAvailability(allFreelancers, busyFreelancers),
        equipments: mapWithAvailability(allEquipments, busyEquipments)
      }
    })
  } catch (err) {
    next(err)
  }
}
