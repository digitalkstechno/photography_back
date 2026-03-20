import Payment from "../schemas/payment.schema.js"
import Party from "../schemas/party.schema.js"
import { invoiceService } from "./invoice.service.js"

export const paymentService = {

  findAll: async (filter = {}) => {
    return Payment.find(filter)
      .populate("party", "name phone partyType")
      .populate("event", "eventType startDate title")
      .populate("invoice", "invoiceNumber grandTotal paidAmount status")
      .sort({ date: -1 })
      .lean()
  },

  findById: async (id) => {
    return Payment.findById(id)
      .populate("party", "name phone email partyType")
      .populate("event", "eventType startDate endDate location title")
      .populate("invoice", "invoiceNumber grandTotal paidAmount status")
      .lean()
  },

  findByParty: async (partyId) => {
    return Payment.find({ party: partyId })
      .populate("event", "eventType startDate title")
      .populate("invoice", "invoiceNumber grandTotal")
      .sort({ date: -1 })
      .lean()
  },

  create: async (data) => {
    // Validate party exists
    const party = await Party.findById(data.party).lean()
    if (!party) throw Object.assign(new Error("Party not found"), { status: 404 })

    const payment = await Payment.create({
      party: data.party,
      event: data.event || null,
      invoice: data.invoice || null,
      amount: data.amount,
      type: data.type,
      mode: data.mode || "CASH",
      date: data.date || new Date(),
      description: data.description,
      reference: data.reference
    })

    // If payment is linked to an invoice, update the invoice's paid amount
    if (data.invoice && data.type === "IN") {
      await invoiceService.recordPayment(data.invoice, data.amount)
    }

    return payment.toObject()
  },

  update: async (id, data) => {
    const payment = await Payment.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean()
    if (!payment) throw Object.assign(new Error("Payment not found"), { status: 404 })
    return payment
  },

  remove: async (id) => {
    const payment = await Payment.findByIdAndDelete(id).lean()
    if (!payment) throw Object.assign(new Error("Payment not found"), { status: 404 })
    return payment
  },

  getSummary: async () => {
    const result = await Payment.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ])

    const summary = { totalIn: 0, totalOut: 0, countIn: 0, countOut: 0 }
    result.forEach(r => {
      if (r._id === "IN") { summary.totalIn = r.total; summary.countIn = r.count }
      if (r._id === "OUT") { summary.totalOut = r.total; summary.countOut = r.count }
    })
    summary.netBalance = summary.totalIn - summary.totalOut

    return summary
  }
}