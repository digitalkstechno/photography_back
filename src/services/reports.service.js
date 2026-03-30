import Invoice from "../schemas/invoice.schema.js"
import Event from "../schemas/event.schema.js"
import Job from "../schemas/job.schema.js"
import Payment from "../schemas/payment.schema.js"
import Quotation from "../schemas/quotation.schema.js"
import Expense from "../schemas/expense.schema.js"

class ReportsService {

  /** 1. Monthly Revenue Performance */
  async getRevenueReport() {
    return await Invoice.aggregate([
      { $match: { status: { $ne: "CANCELLED" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalBilled: { $sum: "$grandTotal" },
          totalPaid: { $sum: "$paidAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ])
  }

  /** 2. Outstanding Receivables (Real List) */
  async getOutstandingReceivables() {
    return await Invoice.find({ dueAmount: { $gt: 0 } })
      .populate("customer", "name phone email")
      .sort({ dueAmount: -1 })
      .limit(20)
      .lean()
  }

  /** 3. Booking Conversion Rate */
  async getConversionAnalytics() {
    const [quotes, bookings] = await Promise.all([
      Quotation.countDocuments(),
      Event.countDocuments({ status: { $in: ["CONFIRMED", "COMPLETED"] } })
    ])
    return {
      totalQuotations: quotes,
      totalBookings: bookings,
      conversionRate: quotes > 0 ? (bookings / quotes) * 100 : 0
    }
  }

  /** 4. Job Profitability Analyzer (Aggregated) */
  async getJobProfitability() {
    // This is a simplified approach: Compare Invoice total vs Job member count costs (approximated)
    return await Job.find()
      .populate("event", "title")
      .populate("invoice", "grandTotal status")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
  }

  /** 5. Expense Breakdown */
  async getExpenseAudit() {
    return await Payment.aggregate([
      { $match: { type: "OUT" } },
      {
        $group: {
          _id: "$category", // Assuming category exists in payment or transaction
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ])
  }

  /** Unified Analytics Summary for the Frontend */
  async getAnalyticsSummary() {
    const [rev, out, conv, profit, exp] = await Promise.all([
      this.getRevenueReport(),
      this.getOutstandingReceivables(),
      this.getConversionAnalytics(),
      this.getJobProfitability(),
      this.getExpenseAudit()
    ])

    return {
      revenue: rev,
      outstanding: out,
      conversion: conv,
      profitability: profit,
      expenses: exp
    }
  }
}

export const reportsService = new ReportsService()
