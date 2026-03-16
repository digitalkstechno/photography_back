import prisma from "../config/prisma.js"
import { createBaseService } from "../core/base.service.js"

const base = createBaseService(prisma.transaction)

const requireNumber = (value, fieldName) => {
    const n = Number(value)
    if (!Number.isFinite(n)) throw new Error(`Invalid ${fieldName}`)
    return n
}

const sumLineTotals = (items) =>
    items.reduce((acc, i) => acc + requireNumber(i.quantity, "quantity") * requireNumber(i.price, "price"), 0)

const getTypeId = async (name) => {
    const row = await prisma.transactionType.findUnique({ where: { name } })
    if (!row) throw new Error(`Missing TransactionType: ${name}`)
    return row.id
}

const getStatusId = async (name) => {
    const row = await prisma.transactionStatus.findUnique({ where: { name } })
    if (!row) throw new Error(`Missing TransactionStatus: ${name}`)
    return row.id
}

const fullInclude = {
    party: { include: { partyType: true } },
    transactionType: true,
    status: true,
    items: { include: { item: { include: { unit: true } } } },
    payments: { include: { paymentMethod: true } }
}

export const transactionService = {

    ...base,

    findAll: () =>
        prisma.transaction.findMany({
            include: fullInclude,
            orderBy: { createdAt: "desc" }
        }),

    findById: (id) =>
        prisma.transaction.findUnique({
            where: { id },
            include: fullInclude
        }),

    getSalesQuotations: () =>
        prisma.transaction.findMany({
            where: { transactionType: { name: "SALE_QUOTATION" } },
            include: fullInclude,
            orderBy: { createdAt: "desc" }
        }),

    getSalesInvoices: () =>
        prisma.transaction.findMany({
            where: { transactionType: { name: "SALE_INVOICE" } },
            include: fullInclude,
            orderBy: { createdAt: "desc" }
        }),

    getPurchaseInvoices: () =>
        prisma.transaction.findMany({
            where: { transactionType: { name: "PURCHASE_INVOICE" } },
            include: fullInclude,
            orderBy: { createdAt: "desc" }
        }),

    createTransactionWithItems: async ({ transaction, items }) => {
        return prisma.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: transaction
            })

            const preparedItems = items.map(i => ({
                transactionId: newTransaction.id,
                itemId: i.itemId,
                quantity: i.quantity,
                price: i.price,
                total: i.quantity * i.price
            }))

            await tx.transactionItem.createMany({
                data: preparedItems
            })

            return tx.transaction.findUnique({
                where: { id: newTransaction.id },
                include: fullInclude
            })
        })
    },

    createSalesQuotation: async ({ partyId, items = [], notes }) => {
        const transactionTypeId = await getTypeId("SALE_QUOTATION")
        const statusId = await getStatusId("UNPAID")
        const total = sumLineTotals(items)

        return transactionService.createTransactionWithItems({
            transaction: {
                partyId: requireNumber(partyId, "partyId"),
                transactionTypeId,
                statusId,
                total,
                notes: notes ?? null
            },
            items
        })
    },

    createSalesInvoice: async ({ partyId, items = [], notes }) => {
        const transactionTypeId = await getTypeId("SALE_INVOICE")
        const statusId = await getStatusId("UNPAID")
        const total = sumLineTotals(items)

        return transactionService.createTransactionWithItems({
            transaction: {
                partyId: requireNumber(partyId, "partyId"),
                transactionTypeId,
                statusId,
                total,
                notes: notes ?? null
            },
            items
        })
    },

    createPurchaseInvoice: async ({ partyId, items = [], notes }) => {
        const transactionTypeId = await getTypeId("PURCHASE_INVOICE")
        const statusId = await getStatusId("UNPAID")
        const total = sumLineTotals(items)

        return transactionService.createTransactionWithItems({
            transaction: {
                partyId: requireNumber(partyId, "partyId"),
                transactionTypeId,
                statusId,
                total,
                notes: notes ?? null
            },
            items
        })
    },

    convertQuotationToInvoice: async (quotationId) => {
        return prisma.$transaction(async (tx) => {
            const quotation = await tx.transaction.findUnique({
                where: { id: quotationId },
                include: { items: true, transactionType: true }
            })
            if (!quotation) throw new Error("Quotation not found")
            if (quotation.transactionType?.name !== "SALE_QUOTATION") {
                throw new Error("Only SALE_QUOTATION can be converted")
            }

            const invoiceTypeId = await getTypeId("SALE_INVOICE")
            const statusId = await getStatusId("UNPAID")

            const newInvoice = await tx.transaction.create({
                data: {
                    partyId: quotation.partyId,
                    transactionTypeId: invoiceTypeId,
                    statusId,
                    referenceId: quotation.id,
                    total: quotation.total,
                    notes: quotation.notes ?? null
                }
            })

            if (quotation.items.length > 0) {
                await tx.transactionItem.createMany({
                    data: quotation.items.map((i) => ({
                        transactionId: newInvoice.id,
                        itemId: i.itemId,
                        quantity: i.quantity,
                        price: i.price,
                        total: i.total ?? i.quantity * i.price
                    }))
                })
            }

            return tx.transaction.findUnique({
                where: { id: newInvoice.id },
                include: fullInclude
            })
        })
    }
}