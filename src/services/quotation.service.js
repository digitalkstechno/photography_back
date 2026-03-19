import Quotation from "../schemas/quotation.schema.js"
import Service from "../schemas/service.schema.js"

// Valid status transitions
const VALID_TRANSITIONS = {
  DRAFT: ["SENT"],
  SENT: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["CONVERTED"],
  REJECTED: [],
  CONVERTED: []
}

function assertTransition(current, next) {
  const allowed = VALID_TRANSITIONS[current]
  if (!allowed || !allowed.includes(next)) {
    throw Object.assign(
      new Error(`Cannot change quotation status from ${current} to ${next}`),
      { status: 400 }
    )
  }
}

export const quotationService = {

  findAll: async () => {
    return Quotation.find()
      .populate("customer", "name phone email")
      .populate("items.service", "name type")
      .sort({ createdAt: -1 })
      .lean()
  },

  findById: async (id) => {
    return Quotation.findById(id)
      .populate("customer", "name phone email address")
      .populate("items.service", "name type pricePerDay")
      .populate("convertedToEvent")
      .lean()
  },

  create: async (data) => {
    const items = []
    for (const item of data.items || []) {
      const service = await Service.findById(item.service).lean()
      if (!service) throw Object.assign(new Error(`Service ${item.service} not found`), { status: 404 })

      const pricePerDay = item.pricePerDay || service.pricePerDay
      const days = item.days || 1
      items.push({
        service: service._id,
        days,
        pricePerDay,
        total: pricePerDay * days
      })
    }

    const quotation = new Quotation({
      customer: data.customer,
      items,
      discount: data.discount || 0,
      notes: data.notes,
      validUntil: data.validUntil,
      status: "DRAFT"
    })

    await quotation.save()
    return quotation.toObject()
  },

  update: async (id, data) => {
    const quotation = await Quotation.findById(id)
    if (!quotation) throw Object.assign(new Error("Quotation not found"), { status: 404 })

    if (quotation.status === "CONVERTED") {
      throw Object.assign(new Error("Cannot edit a converted quotation"), { status: 400 })
    }

    if (data.status && data.status !== quotation.status) {
      assertTransition(quotation.status, data.status)
      quotation.status = data.status
    }

    if (data.items) {
      const items = []
      for (const item of data.items) {
        const service = await Service.findById(item.service).lean()
        if (!service) throw Object.assign(new Error(`Service ${item.service} not found`), { status: 404 })

        const pricePerDay = item.pricePerDay || service.pricePerDay
        const days = item.days || 1
        items.push({
          service: service._id,
          days,
          pricePerDay,
          total: pricePerDay * days
        })
      }
      quotation.items = items
    }

    if (data.discount !== undefined) quotation.discount = data.discount
    if (data.notes !== undefined) quotation.notes = data.notes
    if (data.validUntil !== undefined) quotation.validUntil = data.validUntil

    await quotation.save()
    return quotation.toObject()
  },

  remove: async (id) => {
    const quotation = await Quotation.findById(id)
    if (!quotation) throw Object.assign(new Error("Quotation not found"), { status: 404 })
    if (quotation.status === "CONVERTED") {
      throw Object.assign(new Error("Cannot delete a converted quotation"), { status: 400 })
    }
    await quotation.deleteOne()
    return quotation.toObject()
  },

  sendToCustomer: async (id) => {
    const quotation = await Quotation.findById(id)
    if (!quotation) throw Object.assign(new Error("Quotation not found"), { status: 404 })
    assertTransition(quotation.status, "SENT")
    quotation.status = "SENT"
    await quotation.save()
    return quotation.toObject()
  }
}
