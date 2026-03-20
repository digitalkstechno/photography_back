import { freelancerService } from "../services/freelancer.service.js"
import Event from "../schemas/event.schema.js"

export const getFreelancers = async (req, res, next) => {
  try {
    const data = req.query.skill
      ? await freelancerService.findBySkill(req.query.skill.toUpperCase())
      : await freelancerService.findAll(req.query)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getFreelancerById = async (req, res, next) => {
  try {
    const data = await freelancerService.findById(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: "Freelancer not found" })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const createFreelancer = async (req, res, next) => {
  try {
    const data = await freelancerService.create(req.body)
    res.status(201).json({ success: true, data, message: "Freelancer created" })
  } catch (err) {
    next(err)
  }
}

export const updateFreelancer = async (req, res, next) => {
  try {
    const data = await freelancerService.update(req.params.id, req.body)
    res.json({ success: true, data, message: "Freelancer updated" })
  } catch (err) {
    next(err)
  }
}

export const deleteFreelancer = async (req, res, next) => {
  try {
    await freelancerService.remove(req.params.id)
    res.json({ success: true, message: "Freelancer deleted" })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /freelancers/availability?startDate=&endDate=&excludeEventId=
 * Returns all freelancers with isAvailable flag and conflict info.
 */
export const getAvailability = async (req, res, next) => {
  try {
    const { startDate, endDate, excludeEventId } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate and endDate are required" })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Find all events that overlap the given date range
    const conflictQuery = {
      status: { $ne: "CANCELLED" },
      startDate: { $lte: end },
      endDate: { $gte: start }
    }
    if (excludeEventId) {
      conflictQuery._id = { $ne: excludeEventId }
    }

    const overlappingEvents = await Event.find(conflictQuery)
      .select("_id title startDate endDate teamMembers")
      .lean()

    // Build a map: freelancerId → conflicting event info
    const busyMap = new Map()
    for (const ev of overlappingEvents) {
      for (const memberId of ev.teamMembers || []) {
        const id = memberId.toString()
        if (!busyMap.has(id)) {
          busyMap.set(id, {
            eventId: ev._id,
            eventTitle: ev.title || "Unnamed Event",
            startDate: ev.startDate,
            endDate: ev.endDate
          })
        }
      }
    }

    // Get all active freelancers
    const allFreelancers = await freelancerService.findAll(req.query)

    // Annotate with availability
    const data = allFreelancers.map(f => {
      const id = f._id.toString()
      const conflict = busyMap.get(id)
      return {
        ...f.toObject ? f.toObject() : f,
        isAvailable: !conflict,
        conflict: conflict || null
      }
    })

    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
