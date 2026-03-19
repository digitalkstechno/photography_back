import Invoice from "../schemas/invoice.schema.js"
import Quotation from "../schemas/quotation.schema.js"
import Service from "../schemas/service.schema.js"

export const invoiceService = {

  findAll: async (filter = {}) => {
    return Invoice.find(filter)
      .populate("customer", "name phone email")
      .populate("quotation", "totalAmount finalAmount status")
      .populate("items.service", "name type")
      .sort({ createdAt: -1 })
      .lean()
  },

  findById: async (id) => {
    return Invoice.findById(id)
      .populate("customer", "name phone email address")
      .populate("quotation", "totalAmount finalAmount discount status")
      .populate("items.service", "name type pricePerDay")
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
        description: item.description || service.name,
        days,
        pricePerDay,
        total: pricePerDay * days
      })
    }

    const invoice = new Invoice({
      customer: data.customer,
      quotation: data.quotation || null,
      items,
      discount: data.discount || 0,
      tax: data.tax || 0,
      notes: data.notes,
      dueDate: data.dueDate,
      status: "DRAFT"
    })

    await invoice.save()
    return invoice.toObject()
  },

  // Create invoice directly from an accepted quotation — auto-populates everything
  createFromQuotation: async (quotationId) => {
    const quotation = await Quotation.findById(quotationId).populate("items.service")
    if (!quotation) throw Object.assign(new Error("Quotation not found"), { status: 404 })

    // Removed status guard to allow direct conversion
    
    // Copy items from quotation
    const items = quotation.items.map(item => ({
      service: item.service._id || item.service,
      description: item.service.name || "",
      days: item.days,
      pricePerDay: item.pricePerDay,
      total: item.total
    }))

    const invoice = new Invoice({
      customer: quotation.customer,
      quotation: quotation._id,
      items,
      discount: quotation.discount || 0,
      tax: 0,
      notes: quotation.notes,
      status: "DRAFT"
    })

    await invoice.save()

    // Mark quotation as ACCEPTED (per user request)
    quotation.status = "ACCEPTED"
    await quotation.save()

    return invoice.toObject()
  },

  update: async (id, data) => {
    const invoice = await Invoice.findById(id)
    if (!invoice) throw Object.assign(new Error("Invoice not found"), { status: 404 })

    if (invoice.status === "PAID") {
      throw Object.assign(new Error("Cannot edit a fully paid invoice"), { status: 400 })
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
          description: item.description || service.name,
          days,
          pricePerDay,
          total: pricePerDay * days
        })
      }
      invoice.items = items
    }

    if (data.discount !== undefined) invoice.discount = data.discount
    if (data.tax !== undefined) invoice.tax = data.tax
    if (data.notes !== undefined) invoice.notes = data.notes
    if (data.dueDate !== undefined) invoice.dueDate = data.dueDate
    if (data.status && data.status !== invoice.status) invoice.status = data.status

    await invoice.save()
    return invoice.toObject()
  },

  remove: async (id) => {
    const invoice = await Invoice.findById(id)
    if (!invoice) throw Object.assign(new Error("Invoice not found"), { status: 404 })
    if (invoice.status === "PAID") {
      throw Object.assign(new Error("Cannot delete a paid invoice"), { status: 400 })
    }
    await invoice.deleteOne()
    return invoice.toObject()
  },

  // Update paid amount and status (called by payment service)
  recordPayment: async (invoiceId, amount) => {
    const invoice = await Invoice.findById(invoiceId)
    if (!invoice) return null

    invoice.paidAmount = (invoice.paidAmount || 0) + amount
    if (invoice.paidAmount >= invoice.grandTotal) {
      invoice.status = "PAID"
    } else if (invoice.paidAmount > 0) {
      invoice.status = "PARTIALLY_PAID"
    }

    await invoice.save()
    return invoice.toObject()
  }
}
