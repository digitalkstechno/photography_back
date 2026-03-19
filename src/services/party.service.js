import Party from "../schemas/party.schema.js"
import Payment from "../schemas/payment.schema.js"
import { BaseService } from "../core/classbase.service.js"

class PartyService extends BaseService {
  constructor() {
    super(Party)
  }

  async findAll() {
    return this.model.find().sort({ createdAt: -1 }).lean()
  }

  async getCustomers() {
    return this.model.find({ partyType: { $in: ["CUSTOMER", "BOTH"] } }).sort({ name: 1 }).lean()
  }

  async getVendors() {
    return this.model.find({ partyType: { $in: ["VENDOR", "BOTH"] } }).sort({ name: 1 }).lean()
  }

  async searchParties(q) {
    if (!q) return this.findAll()
    const regex = new RegExp(q, "i")
    return this.model.find({
      $or: [
        { name: regex },
        { phone: regex },
        { email: regex }
      ]
    }).lean()
  }

  async getPartyLedger(partyId) {
    const party = await this.model.findById(partyId).lean()
    if (!party) throw Object.assign(new Error("Party not found"), { status: 404 })

    const payments = await Payment.find({ party: partyId }).sort({ date: 1 }).lean()

    let totalCredit = 0  // IN payments
    let totalDebit = 0   // OUT payments

    const entries = payments.map(p => {
      if (p.type === "IN") {
        totalCredit += p.amount
      } else {
        totalDebit += p.amount
      }
      return {
        ...p,
        runningBalance: totalCredit - totalDebit
      }
    })

    return {
      party,
      totalCredit,
      totalDebit,
      balance: totalCredit - totalDebit,
      entries
    }
  }
}

export const partyService = new PartyService()