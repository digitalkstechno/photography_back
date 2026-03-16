import prisma from "../config/prisma.js";
import { createBaseService } from "../core/base.service.js";

const base = createBaseService(prisma.ledgerEntry);

export const ledgerService = {
  ...base,
  findAll: async (params = {}) => {
    const { search, partyId } = params;
    return prisma.ledgerEntry.findMany({
      where: {
        AND: [
          partyId ? { partyId: parseInt(partyId) } : {},
          search ? {
            OR: [
              { description: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
              { party: { name: { contains: search, mode: 'insensitive' } } }
            ]
          } : {}
        ]
      },
      include: {
        party: true,
        paymentMethod: true
      },
      orderBy: { date: 'desc' }
    });
  }
};
