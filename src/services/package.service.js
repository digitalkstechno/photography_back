import prisma from "../config/prisma.js";
import { createBaseService } from "../core/base.service.js";

const base = createBaseService(prisma.package);

export const packageService = {
  ...base,

  findById: async (id) => {
    return prisma.package.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            item: true
          }
        }
      }
    });
  },

  create: async (data) => {
    const { items, ...packageData } = data;
    
    return prisma.package.create({
      data: {
        ...packageData,
        items: items && items.length > 0 ? {
          create: items.map(it => ({
            itemId: Number(it.itemId),
            quantity: Number(it.quantity || 1)
          }))
        } : undefined
      },
      include: {
        items: true
      }
    });
  },

  update: async (id, data) => {
    const { items, ...packageData } = data;

    // Use transaction to update package and sync items
    return prisma.$transaction(async (tx) => {
      // 1. Update basic package info
      const updatedPackage = await tx.package.update({
        where: { id },
        data: packageData
      });

      // 2. If items provided, sync them
      if (items !== undefined) {
        // Simple approach: delete all existing and re-create
        await tx.packageItem.deleteMany({
          where: { packageId: id }
        });

        if (items.length > 0) {
          await tx.packageItem.createMany({
            data: items.map(it => ({
              packageId: id,
              itemId: Number(it.itemId),
              quantity: Number(it.quantity || 1)
            }))
          });
        }
      }

      return tx.package.findUnique({
        where: { id },
        include: { items: true }
      });
    });
  },

  findAll: async (params = {}) => {
    const { search } = params;
    return prisma.package.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      } : {},
      include: {
        items: {
          include: {
            item: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
};
