import prisma from "../config/prisma.js"

export const lookupService = {

  // ── Party Types ──
  getPartyTypes: () => prisma.partyType.findMany({ orderBy: { name: "asc" } }),

  // ── Units ──
  getUnits: () => prisma.unit.findMany({ orderBy: { name: "asc" } }),

  createUnit: (data) => prisma.unit.create({ data }),

  updateUnit: (id, data) => prisma.unit.update({ where: { id }, data }),

  deleteUnit: (id) => prisma.unit.delete({ where: { id } }),

  // ── Item Categories ──
  getCategories: () => prisma.itemCategory.findMany({ orderBy: { name: "asc" } }),

  createCategory: (data) => prisma.itemCategory.create({ data }),

  updateCategory: (id, data) => prisma.itemCategory.update({ where: { id }, data }),

  deleteCategory: (id) => prisma.itemCategory.delete({ where: { id } }),

  // ── Tags ──
  getTags: () => prisma.tag.findMany({ orderBy: { name: "asc" } }),

  createTag: (data) => prisma.tag.create({ data }),

  updateTag: (id, data) => prisma.tag.update({ where: { id }, data }),

  deleteTag: (id) => prisma.tag.delete({ where: { id } }),

  // ── Payment Methods ──
  getPaymentMethods: () => prisma.paymentMethod.findMany({ orderBy: { name: "asc" } }),

  // ── Transaction Types ──
  getTransactionTypes: () => prisma.transactionType.findMany({ orderBy: { name: "asc" } }),

  // ── Transaction Statuses ──
  getTransactionStatuses: () => prisma.transactionStatus.findMany({ orderBy: { name: "asc" } })
}
