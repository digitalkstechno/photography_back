import { BaseService } from "../core/classbase.service.js"
import Quotation from "../schemas/quotation.schema.js"
import Service from "../schemas/service.schema.js"
import { packageService } from "./package.service.js"

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
      if (item.service) {
        const service = await Service.findById(item.service).lean()
        if (service) {
          const pricePerDay = item.pricePerDay || service.pricePerDay
          const days = item.days || 1
          items.push({
            service: service._id,
            name: service.name,
            days,
            pricePerDay,
            total: pricePerDay * days,
            source: item.source || "Individual"
          })
          continue
        }
      }
      
      // Custom or unknown service - use provided data
      items.push({
        ...item,
        total: item.quotedPrice != null ? item.quotedPrice : (item.fixedPrice || (item.days * (item.pricePerDay || 0)))
      })
    }
    return items
  }

  async beforeCreate(data) {
    if (!data.items || data.items.length === 0) {
      data.items = []

      // 🔥 Auto-populate from packages ONLY if items is empty
      if (data.packages && Array.isArray(data.packages)) {
        for (const pkgId of data.packages) {
          const pkg = await packageService.findById(pkgId);
          if (pkg && pkg.includedServices) {
            for (const srv of pkg.includedServices) {
              data.items.push({
                service: srv._id || srv,
                days: 1,
                source: "Package"
              });
            }
          }
        }
      }

      // 🔥 Auto-populate from services ONLY if items is empty
      if (data.services && Array.isArray(data.services)) {
        for (const srvId of data.services) {
          data.items.push({
            service: srvId,
            days: 1,
            source: "Individual"
          });
        }
      }
    }

    data.items = await this.buildItems(data.items)
    data.status = "DRAFT"
    data.discount = data.discount || 0
    return data
  }

  async update(id, data) {
    const quotation = await this.model.findById(id)
    if (!quotation) throw Object.assign(new Error("Quotation not found"), { status: 404 })

    if (quotation.status === "CONVERTED") {
      throw Object.assign(new Error("Cannot edit a converted quotation"), { status: 400 })
    }

    if (data.status && data.status !== quotation.status) {
      assertTransition(quotation.status, data.status)
    }

    // 🔥 Auto-populate from packages/services if provided
    if (data.packages || data.services) {
      if (!data.items) data.items = [...(quotation.items || [])];

      if (data.packages && Array.isArray(data.packages)) {
        for (const pkgId of data.packages) {
          const pkg = await packageService.findById(pkgId);
          if (pkg && pkg.includedServices) {
            for (const srv of pkg.includedServices) {
              data.items.push({
                service: srv._id || srv,
                days: 1,
                source: `Package: ${pkg.name}`
              });
            }
          }
        }
      }

      if (data.services && Array.isArray(data.services)) {
        for (const srvId of data.services) {
          data.items.push({
            service: srvId,
            days: 1,
            source: "Individual"
          });
        }
      }
    }

    if (data.items) {
      data.items = await this.buildItems(data.items)
    }

    // 🔥 Update fields manually and call .save() to trigger calculations
    Object.assign(quotation, data)
    await quotation.save()
    return quotation.toObject()
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
