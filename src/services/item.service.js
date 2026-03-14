import prisma from "../config/prisma.js";
import { createBaseService } from "../core/base.service.js";

const base = createBaseService(prisma.item);

export const itemService = {
    ...base,

    getItemsByCategory: async (categoryId, pagination = {}) => {
        const { skip = 0, take = 20 } = pagination;

        return prisma.item.findMany({
            where: {
                categoryId: Number(categoryId)
            },
            skip,
            take
        });
    },

    searchItems: async (keyword, pagination = {}) => {
        const { skip = 0, take = 20 } = pagination;

        return prisma.item.findMany({
            where: {
                name: {
                    contains: keyword,
                    mode: "insensitive"
                }
            },
            skip,
            take
        });
    }
};