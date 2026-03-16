import prisma from "../config/prisma.js"
import { createBaseService } from "../core/base.service.js"

const base = createBaseService(prisma.payment)

const getStatusId = async (name) => {
  const row = await prisma.transactionStatus.findUnique({ where: { name } })
  if (!row) throw new Error(`Missing TransactionStatus: ${name}`)
  return row.id
}

const paymentIncludes = {
  transaction: {
    include: {
      party: true,
      transactionType: true,
      status: true
    }
  },
  paymentMethod: true
}

export const paymentService = {
  ...base,

  findAll: () =>
    prisma.payment.findMany({
      include: paymentIncludes,
      orderBy: { createdAt: "desc" }
    }),

  findById: (id) =>
    prisma.payment.findUnique({
      where: { id },
      include: paymentIncludes
    }),

  getPaymentsByTransaction: (transactionId) =>
    prisma.payment.findMany({
      where: { transactionId: Number(transactionId) },
      include: { paymentMethod: true },
      orderBy: { createdAt: "desc" }
    }),

  createAndUpdateTransactionStatus: async ({ transactionId, paymentMethodId, amount, reference }) => {
    const txId = Number(transactionId)
    if (!Number.isFinite(txId)) throw new Error("Invalid transactionId")

    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt <= 0) throw new Error("Invalid amount")

    const methodId = Number(paymentMethodId)
    if (!Number.isFinite(methodId)) throw new Error("Invalid paymentMethodId")

    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          transactionId: txId,
          paymentMethodId: methodId,
          amount: amt,
          reference: reference ?? null
        }
      })

      await recalculateTransactionStatus(tx, txId)

      return tx.payment.findUnique({
        where: { id: payment.id },
        include: paymentIncludes
      })
    })
  },

  deleteAndRecalculate: async (paymentId) => {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId }
      })
      if (!payment) throw new Error("Payment not found")

      await tx.payment.delete({ where: { id: paymentId } })

      await recalculateTransactionStatus(tx, payment.transactionId)

      return { success: true }
    })
  }
}

async function recalculateTransactionStatus(tx, transactionId) {
  const transaction = await tx.transaction.findUnique({
    where: { id: transactionId },
    include: { payments: true }
  })
  if (!transaction) throw new Error("Transaction not found")

  const paid = transaction.payments.reduce((acc, p) => acc + p.amount, 0)
  const total = transaction.total ?? 0

  const statusName = paid <= 0 ? "UNPAID" : paid + 1e-9 >= total ? "PAID" : "PARTIAL"
  const statusId = await getStatusId(statusName)

  await tx.transaction.update({
    where: { id: transactionId },
    data: { statusId }
  })
}