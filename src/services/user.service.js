import prisma from "../config/prisma.js";
import { createBaseService } from "../core/base.service.js";
import bcrypt from "bcryptjs";

const base = createBaseService(prisma.user);

export const userService = {
  ...base,
  findAll: async (params = {}) => {
    const { search } = params;
    return prisma.user.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { role: { contains: search, mode: 'insensitive' } }
        ]
      } : {},
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        skillset: true,
        charges: true,
        isFreelance: true,
        createdAt: true
      }
    });
  },
  create: async (data) => {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      data.password = await bcrypt.hash("staff123", 10); // Default password
    }
    return prisma.user.create({ data });
  }
};
