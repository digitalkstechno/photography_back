import prisma from "../config/prisma.js";
import { createBaseService } from "../core/base.service.js";

const base = createBaseService(prisma.availability);

export const availabilityService = {
  ...base,
  findAll: async (params = {}) => {
    const { search } = params;
    return prisma.availability.findMany({
      where: search ? {
        OR: [
          { reason: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } }
        ]
      } : {},
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { date: 'asc' }
    });
  }
};
