import { BaseService } from "../core/classbase.service.js"
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

class QuotationService extends BaseService {
  constructor() {
    super(Quotation)
  }

  async findAll(filter = {}) {
    return super.findAll(filter, {
      populate: [
        { path: "customer", select: "name phone email" },
        { path: "items.service", select: "name type" }
      ],
      sort: { createdAt: -1 }
    })
  }

  async findById(id) {
    return super.findById(id, {
      populate: [
        { path: "customer", select: "name phone email address" },
        { path: "items.service", select: "name type pricePerDay" },
        { path: "convertedToEvent" }
      ]
    })
  }

  async buildItems(rawItems = []) {
    const items = []
    for (const item of rawItems) {
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
    return items
  }

  async beforeCreate(data) {
    data.items = await this.buildItems(data.items)
    data.status = "DRAFT"
    data.discount = data.discount || 0
    return data
  }

  async update(id, data) {
    const quotation = await this.findById(id)
    if (!quotation) throw Object.assign(new Error("Quotation not found"), { status: 404 })

    if (quotation.status === "CONVERTED") {
      throw Object.assign(new Error("Cannot edit a converted quotation"), { status: 400 })
    }

    if (data.status && data.status !== quotation.status) {
      assertTransition(quotation.status, data.status)
    }

    if (data.items) {
      data.items = await this.buildItems(data.items)
    }

    return super.update(id, data)
  }

  async remove(id) {
    const quotation = await this.findById(id)
    if (!quotation) throw Object.assign(new Error("Quotation not found"), { status: 404 })
    if (quotation.status === "CONVERTED") {
      throw Object.assign(new Error("Cannot delete a converted quotation"), { status: 400 })
    }
    return super.remove(id)
  }

  async sendToCustomer(id) {
    const quotation = await this.model.findById(id)
    if (!quotation) throw Object.assign(new Error("Quotation not found"), { status: 404 })
    assertTransition(quotation.status, "SENT")
    quotation.status = "SENT"
    await quotation.save()
    return quotation.toObject()
  }
}

export const quotationService = new QuotationService()
