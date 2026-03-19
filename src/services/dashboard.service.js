import Event from "../schemas/event.schema.js"
import Invoice from "../schemas/invoice.schema.js"
import Payment from "../schemas/payment.schema.js"
import Party from "../schemas/party.schema.js"
import Quotation from "../schemas/quotation.schema.js"

export const dashboardService = {

  getSummary: async () => {
    const [
      eventCounts,
      invoiceSummary,
      paymentSummary,
      partyCount,
      quotationCounts,
      recentEvents
    ] = await Promise.all([
      Event.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),

      Invoice.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            total: { $sum: "$grandTotal" },
            paid: { $sum: "$paidAmount" }
          }
        }
      ]),

      Payment.aggregate([
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        }
      ]),

      Party.countDocuments(),

      Quotation.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),

      Event.find({ status: { $ne: "CANCELLED" }, startDate: { $gte: new Date() } })
        .populate("customer", "name phone")
        .populate("invoice", "invoiceNumber grandTotal status")
        .sort({ startDate: 1 })
        .limit(5)
        .lean()
    ])

    // Events
    const events = { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
    eventCounts.forEach(e => {
      events.total += e.count
      events[e._id.toLowerCase()] = e.count
    })

    // Invoices
    const invoices = { total: 0, totalBilled: 0, totalPaid: 0, outstanding: 0 }
    invoiceSummary.forEach(i => {
      invoices.total += i.count
      invoices.totalBilled += i.total
      invoices.totalPaid += i.paid
      if (i._id) invoices[i._id.toLowerCase()] = i.count
    })
    invoices.outstanding = invoices.totalBilled - invoices.totalPaid

    // Payments
    const payments = { totalIn: 0, totalOut: 0, countIn: 0, countOut: 0 }
    paymentSummary.forEach(p => {
      if (p._id === "IN") { payments.totalIn = p.total; payments.countIn = p.count }
      if (p._id === "OUT") { payments.totalOut = p.total; payments.countOut = p.count }
    })
    payments.netBalance = payments.totalIn - payments.totalOut

    // Quotations
    const quotations = { total: 0 }
    quotationCounts.forEach(q => {
      quotations.total += q.count
      if (q._id) quotations[q._id.toLowerCase()] = q.count
    })

    return {
      events,
      invoices,
      payments,
      parties: partyCount,
      quotations,
      upcomingEvents: recentEvents
    }
  }
}
