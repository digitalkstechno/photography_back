import prisma from "../config/prisma.js"
import { createBaseService } from "../core/base.service.js"

const base = createBaseService(prisma.party)

export const partyService = {

  ...base,

  getCustomers: () =>
    prisma.party.findMany({
      where: {
        partyType: {
          name: "Customer"
        }
      }
    }),

  getVendors: () =>
    prisma.party.findMany({
      where: {
        partyType: {
          name: "Vendor"
        }
      }
    }),

  getPartyLedger: (partyId) =>
    prisma.transaction.findMany({
      where: { partyId },
      include: {
        transactionType: true,
        payments: true
      },
      orderBy: { createdAt: "asc" }
    })
}