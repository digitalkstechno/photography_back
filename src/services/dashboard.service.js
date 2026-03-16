import prisma from "../config/prisma.js"

export const dashboardService = {

  getSummary: async () => {
    const [invoices, payments] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          transactionType: {
            name: { in: ["SALE_INVOICE", "PURCHASE_INVOICE"] }
          }
        },
        include: { payments: true, transactionType: true }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        _count: true
      })
    ])

    const totalInvoiced = invoices.reduce((acc, tx) => acc + tx.total, 0)
    const totalPaid = payments._sum.amount || 0
    const totalOutstanding = totalInvoiced - totalPaid

    const saleInvoices = invoices.filter(tx => tx.transactionType.name === "SALE_INVOICE")
    const purchaseInvoices = invoices.filter(tx => tx.transactionType.name === "PURCHASE_INVOICE")

    return {
      totalInvoices: invoices.length,
      totalSaleInvoices: saleInvoices.length,
      totalPurchaseInvoices: purchaseInvoices.length,
      totalInvoiced: Math.round(totalInvoiced * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      totalPayments: payments._count
    }
  },

  getRecentTransactions: (limit = 10) =>
    prisma.transaction.findMany({
      include: {
        party: true,
        transactionType: true,
        status: true
      },
      orderBy: { createdAt: "desc" },
      take: limit
    })
}
