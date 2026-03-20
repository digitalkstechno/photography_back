import Payment from "../schemas/payment.schema.js"
import Party from "../schemas/party.schema.js"

class LedgerService {

  async getPartyLedger(partyId) {
    const party = await Party.findById(partyId).lean()
    if (!party) throw Object.assign(new Error("Party not found"), { status: 404 })

    const payments = await Payment.find({ party: partyId })
      .populate("event", "eventType startDate")
      .sort({ date: 1 })
      .lean()

    let totalCredit = 0
    let totalDebit = 0

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

  async getAllBalances() {
    const balances = await Payment.aggregate([
      {
        $group: {
          _id: "$party",
          totalIn: {
            $sum: { $cond: [{ $eq: ["$type", "IN"] }, "$amount", 0] }
          },
          totalOut: {
            $sum: { $cond: [{ $eq: ["$type", "OUT"] }, "$amount", 0] }
          },
          lastPaymentDate: { $max: "$date" },
          paymentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "parties",
          localField: "_id",
          foreignField: "_id",
          as: "party"
        }
      },
      { $unwind: "$party" },
      {
        $project: {
          _id: 0,
          partyId: "$_id",
          partyName: "$party.name",
          partyPhone: "$party.phone",
          partyType: "$party.partyType",
          totalCredit: "$totalIn",
          totalDebit: "$totalOut",
          balance: { $subtract: ["$totalIn", "$totalOut"] },
          lastPaymentDate: 1,
          paymentCount: 1
        }
      },
      { $sort: { partyName: 1 } }
    ])

    return balances
  }
}

export const ledgerService = new LedgerService()
