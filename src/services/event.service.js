import Event from "../schemas/event.schema.js"
import Invoice from "../schemas/invoice.schema.js"

export const eventService = {

  findAll: async (filter = {}) => {
    return Event.find(filter)
      .populate("customer", "name phone email")
      .populate("quotation", "totalAmount finalAmount status")
      .populate("invoice", "invoiceNumber grandTotal status paidAmount")
      .populate("package", "name price")
      .sort({ startDate: -1 })
      .lean()
  },

  findById: async (id) => {
    return Event.findById(id)
      .populate("customer", "name phone email address")
      .populate("quotation")
      .populate("invoice", "invoiceNumber grandTotal status paidAmount items")
      .populate("package")
      .lean()
  },

  create: async (data) => {
    // If invoice is provided, auto-populate customer and totalAmount
    if (data.invoice) {
      const invoice = await Invoice.findById(data.invoice).lean()
      if (invoice) {
        data.customer = data.customer || invoice.customer
        data.totalAmount = data.totalAmount || invoice.grandTotal
      }
    }

    // Check date availability
    if (data.startDate && data.endDate) {
      const overlapping = await Event.findOne({
        status: { $ne: "CANCELLED" },
        startDate: { $lte: new Date(data.endDate) },
        endDate: { $gte: new Date(data.startDate) }
      })

      if (overlapping && !data.overrideConflicts) {
        throw Object.assign(
          new Error(`Date conflict with existing event "${overlapping.eventType}" (${overlapping.startDate.toISOString().split("T")[0]} – ${overlapping.endDate.toISOString().split("T")[0]})`),
          { status: 409, conflict: true }
        )
      }
    }

    const event = await Event.create({
      customer: data.customer,
      quotation: data.quotation,
      invoice: data.invoice,
      package: data.package,
      eventType: data.eventType,
      title: data.title,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location,
      status: data.status || "CONFIRMED",
      totalAmount: data.totalAmount || 0,
      notes: data.notes
    })

    return event.toObject()
  },

  update: async (id, data) => {
    if (data.startDate && data.endDate) {
      const overlapping = await Event.findOne({
        _id: { $ne: id },
        status: { $ne: "CANCELLED" },
        startDate: { $lte: new Date(data.endDate) },
        endDate: { $gte: new Date(data.startDate) }
      })

      if (overlapping && !data.overrideConflicts) {
        throw Object.assign(
          new Error(`Date conflict with event "${overlapping.eventType}" (${overlapping.startDate.toISOString().split("T")[0]})`),
          { status: 409, conflict: true }
        )
      }
    }

    const { overrideConflicts, ...updateData } = data
    const event = await Event.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean()
    if (!event) throw Object.assign(new Error("Event not found"), { status: 404 })
    return event
  },

  updateStatus: async (id, status) => {
    const event = await Event.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).lean()
    if (!event) throw Object.assign(new Error("Event not found"), { status: 404 })
    return event
  },

  remove: async (id) => {
    const event = await Event.findByIdAndDelete(id).lean()
    if (!event) throw Object.assign(new Error("Event not found"), { status: 404 })
    return event
  },

  checkAvailability: async (startDate, endDate) => {
    const conflicts = await Event.find({
      status: { $ne: "CANCELLED" },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) }
    }).populate("customer", "name").lean()

    return {
      available: conflicts.length === 0,
      conflicts
    }
  }
}
