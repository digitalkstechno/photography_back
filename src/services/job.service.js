import { BaseService } from "../core/classbase.service.js"
import Job from "../schemas/job.schema.js"
import Event from "../schemas/event.schema.js"

class JobService extends BaseService {
  constructor() {
    super(Job)
  }

  getPopulate() {
    return [
      { path: "event", populate: { path: "customer", select: "name phone" } },
      { path: "assignedUsers.user", select: "name email phone" },
      { path: "assignedUsers.freelancer", select: "name phone skill chargePerDay" }
    ]
  }

  async findAll(filter = {}) {
    return super.findAll(filter, {
      populate: this.getPopulate(),
      sort: { createdAt: -1 }
    })
  }

  async findById(id) {
    return super.findById(id, {
      populate: [
        { path: "event", populate: [
          { path: "customer", select: "name phone email" },
          { path: "package", select: "name price" }
        ]},
        { path: "assignedUsers.user", select: "name email phone" },
        { path: "assignedUsers.freelancer", select: "name phone skill chargePerDay" }
      ]
    })
  }

  async findByEvent(eventId) {
    return this.model.find({ event: eventId })
      .populate("assignedUsers.user", "name email")
      .populate("assignedUsers.freelancer", "name phone skill chargePerDay")
      .lean()
  }

  async createFromEvent(eventId, data = {}) {
    const event = await Event.findById(eventId).lean()
    if (!event) throw Object.assign(new Error("Event not found"), { status: 404 })

    const existing = await this.model.findOne({ event: eventId }).lean()
    if (existing) throw Object.assign(new Error("Job already exists for this event"), { status: 409 })

    const assignments = (data.assignedUsers || []).map(a => ({
      user: a.user || null,
      freelancer: a.freelancer || null,
      role: a.role,
      chargePerDay: a.chargePerDay || 0,
      days: a.days || 1,
      totalCharge: (a.chargePerDay || 0) * (a.days || 1)
    }))

    const job = new this.model({
      event: eventId,
      assignedUsers: assignments,
      status: data.status || "PENDING",
      notes: data.notes
    })

    await job.save()
    return job.toObject()
  }

  async update(id, data) {
    const job = await this.model.findById(id)
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
  }

  async remove(id) {
    return super.remove(id)
  }
}

export const jobService = new JobService()
