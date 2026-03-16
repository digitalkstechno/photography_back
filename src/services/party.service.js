import prisma from "../config/prisma.js"
import { createBaseService } from "../core/base.service.js"

const base = createBaseService(prisma.party)

export const partyService = {

  ...base,

  findAll: () =>
    prisma.party.findMany({
      include: {
        partyType: true,
        tags: { include: { tag: true } }
      },
      orderBy: { createdAt: "desc" }
    }),

  findById: (id) =>
    prisma.party.findUnique({
      where: { id },
      include: {
        partyType: true,
        tags: { include: { tag: true } },
        transactions: {
          include: {
            transactionType: true,
            status: true
          },
          orderBy: { createdAt: "desc" },
          take: 5
        }
      }
    }),

  getCustomers: () =>
    prisma.party.findMany({
      where: { partyType: { name: "Customer" } },
      include: { partyType: true, tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" }
    }),

  getVendors: () =>
    prisma.party.findMany({
      where: { partyType: { name: "Vendor" } },
      include: { partyType: true, tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" }
    }),

  searchParties: (query) =>
    prisma.party.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } }
        ]
      },
      include: { partyType: true },
      orderBy: { name: "asc" }
    }),

  getPartyLedger: async (partyId) => {
    const transactions = await prisma.transaction.findMany({
      where: { partyId },
      include: {
        transactionType: true,
        status: true,
        items: { include: { item: true } },
        payments: { include: { paymentMethod: true } }
      },
      orderBy: { createdAt: "asc" }
    })

    // Compute running balance
    let runningBalance = 0
    const ledger = transactions.map((tx) => {
      const totalPaid = tx.payments.reduce((acc, p) => acc + p.amount, 0)
      const outstanding = tx.total - totalPaid
      runningBalance += outstanding

      return {
        ...tx,
        totalPaid,
        outstanding,
        runningBalance
      }
    })

    const summary = {
      totalInvoiced: transactions.reduce((acc, tx) => acc + tx.total, 0),
      totalPaid: transactions.reduce(
        (acc, tx) => acc + tx.payments.reduce((s, p) => s + p.amount, 0),
        0
      ),
      totalOutstanding: runningBalance
    }

    return { ledger, summary }
  }
}