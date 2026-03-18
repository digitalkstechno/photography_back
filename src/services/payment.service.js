// services/payment.service.js

import prisma from "../config/prisma.js"
import { BaseService } from "../core/classbase.service.js"
import { accountService } from "./account.service.js"
import { journalService } from "./journal.service.js"

class PaymentService extends BaseService {
  constructor() {
    super(prisma.payment)
  }

  async afterCreate(payment) {
    const tx = await prisma.$transaction.findUnique({
      where: { id: payment.transactionId }
    })

    const customerAccount =
      await accountService.getOrCreatePartyAccount(
        tx.partyId,
        tx.companyId
      )

    const cashAccount =
      await accountService.getSystemAccount("Cash", tx.companyId)

    const journal = await journalService.createEntry({
      companyId: tx.companyId,
      description: `Payment for Tx #${tx.id}`,
      entries: [
        {
          accountId: cashAccount.id,
          debit: payment.amount,
          credit: 0
        },
        {
          accountId: customerAccount.id,
          debit: 0,
          credit: payment.amount
        }
      ]
    })

    await this.model.update({
      where: { id: payment.id },
      data: { journalId: journal.id }
    })
  }
}

export const paymentService = new PaymentService()