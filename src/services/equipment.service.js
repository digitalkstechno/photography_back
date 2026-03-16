import prisma from "../config/prisma.js";
import { createBaseService } from "../core/base.service.js";

const base = createBaseService(prisma.equipment);

export const equipmentService = {
  ...base,
  findAll: async (params = {}) => {
    const { search } = params;
    return prisma.equipment.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { type: { contains: search, mode: 'insensitive' } },
          { serialNo: { contains: search, mode: 'insensitive' } }
        ]
      } : {},
      include: {
        owner: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
};
