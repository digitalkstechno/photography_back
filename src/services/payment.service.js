import { BaseService } from "../core/classbase.service.js"
import Payment from "../schemas/payment.schema.js"
import Party from "../schemas/party.schema.js"
import { invoiceService } from "./invoice.service.js"
import AppError from "../utils/AppError.js"

class PaymentService extends BaseService {
  constructor() {
    super(Payment)
  }

  getPopulate() {
    return [
      { path: "party", select: "name phone partyType" },
      { path: "event", select: "startDate title" },
      { path: "invoice", select: "invoiceNumber grandTotal paidAmount status" }
    ]
  }

  async findAll(filter = {}) {
    return super.findAll(filter, {
      populate: this.getPopulate(),
      sort: { date: -1 }
    })
  }

  async findById(id) {
    return super.findById(id, {
      populate: [
        { path: "party", select: "name phone email partyType" },
        { path: "event", select: "startDate endDate location title" },
        { path: "invoice", select: "invoiceNumber grandTotal paidAmount status" }
      ]
    })
  }

  async findByParty(partyId) {
    return this.model.find({ party: partyId })
      .populate("event", "startDate title")
      .populate("invoice", "invoiceNumber grandTotal")
      .sort({ date: -1 })
      .lean()
  }

  async create(data) {
    // Validate party exists
    const party = await Party.findById(data.party).lean()
    if (!party) throw new AppError("Party not found", 404);

    const payment = await super.create({
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

    return payment
  }

  async update(id, data) {
    return super.update(id, data)
  }

  async remove(id) {
    return super.remove(id)
  }

  async getSummary() {
    const result = await this.model.aggregate([
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

export const paymentService = new PaymentService()