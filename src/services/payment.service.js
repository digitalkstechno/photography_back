import prisma from "../config/prisma.js"
import { createBaseService } from "../core/base.service.js"

const base = createBaseService(prisma.payment)

const getStatusId = async (name) => {
  const row = await prisma.transactionStatus.findUnique({ where: { name } })
  if (!row) throw new Error(`Missing TransactionStatus: ${name}`)
  return row.id
}

export const paymentService = {
  ...base,

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

      const transaction = await tx.transaction.findUnique({
        where: { id: txId },
        include: { payments: true }
      })
      if (!transaction) throw new Error("Transaction not found")

      const paid = transaction.payments.reduce((acc, p) => acc + p.amount, 0)
      const total = transaction.total ?? 0

      const statusName = paid <= 0 ? "UNPAID" : paid + 1e-9 >= total ? "PAID" : "PARTIAL"
      const statusId = await getStatusId(statusName)

      await tx.transaction.update({
        where: { id: txId },
        data: { statusId }
      })

      return payment
    })
  }
}