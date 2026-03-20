import Job from "../schemas/job.schema.js"
import Event from "../schemas/event.schema.js"

export const jobService = {

  findAll: async () => {
    return Job.find()
      .populate({
        path: "event",
        populate: { path: "customer", select: "name phone" }
      })
      .populate("assignedUsers.user", "name email phone")
      .populate("assignedUsers.freelancer", "name phone skill chargePerDay")
      .sort({ createdAt: -1 })
      .lean()
  },

  findById: async (id) => {
    return Job.findById(id)
      .populate({
        path: "event",
        populate: [
          { path: "customer", select: "name phone email" },
          { path: "package", select: "name price" }
        ]
      })
      .populate("assignedUsers.user", "name email phone")
      .populate("assignedUsers.freelancer", "name phone skill chargePerDay")
      .lean()
  },

  findByEvent: async (eventId) => {
    return Job.find({ event: eventId })
      .populate("assignedUsers.user", "name email")
      .populate("assignedUsers.freelancer", "name phone skill chargePerDay")
      .lean()
  },

  createFromEvent: async (eventId, data = {}) => {
    const event = await Event.findById(eventId).lean()
    if (!event) throw Object.assign(new Error("Event not found"), { status: 404 })

    const existing = await Job.findOne({ event: eventId }).lean()
    if (existing) throw Object.assign(new Error("Job already exists for this event"), { status: 409 })

    const assignments = (data.assignedUsers || []).map(a => ({
      user: a.user || null,
      freelancer: a.freelancer || null,
      role: a.role,
      chargePerDay: a.chargePerDay || 0,
      days: a.days || 1,
      totalCharge: (a.chargePerDay || 0) * (a.days || 1)
    }))

    const job = new Job({
      event: eventId,
      assignedUsers: assignments,
      status: data.status || "PENDING",
      notes: data.notes
    })

    await job.save()
    return job.toObject()
  },

  update: async (id, data) => {
    const job = await Job.findById(id)
    if (!job) throw Object.assign(new Error("Job not found"), { status: 404 })

    if (data.assignedUsers) {
      job.assignedUsers = data.assignedUsers.map(a => ({
        user: a.user || null,
        freelancer: a.freelancer || null,
        role: a.role,
        chargePerDay: a.chargePerDay || 0,
        days: a.days || 1,
        totalCharge: (a.chargePerDay || 0) * (a.days || 1)
      }))
    }

    if (data.status) job.status = data.status
    if (data.notes !== undefined) job.notes = data.notes

    await job.save()
    return job.toObject()
  },

  remove: async (id) => {
    const job = await Job.findByIdAndDelete(id).lean()
    if (!job) throw Object.assign(new Error("Job not found"), { status: 404 })
    return job
  }
}
