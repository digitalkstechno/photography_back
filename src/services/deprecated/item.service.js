import prisma from "../config/prisma.js"
import { createBaseService } from "../core/base.service.js"

const base = createBaseService(prisma.item)

export const itemService = {
  ...base,

  findAll: () =>
    prisma.item.findMany({
      include: { unit: true, category: true },
      orderBy: { createdAt: "desc" }
    }),

  findById: (id) =>
    prisma.item.findUnique({
      where: { id },
      include: { unit: true, category: true }
    }),

  getItemsByCategory: (categoryId) =>
    prisma.item.findMany({
      where: { categoryId: Number(categoryId) },
      include: { unit: true, category: true },
      orderBy: { name: "asc" }
    }),

  searchItems: (keyword) =>
    prisma.item.findMany({
      where: {
        name: { contains: keyword, mode: "insensitive" }
      },
      include: { unit: true, category: true },
      orderBy: { name: "asc" }
    })
}