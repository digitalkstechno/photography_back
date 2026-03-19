import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Note: Ensure you have populated your Accounts table with specific IDs or fetch them dynamically by name.
// For this example, we mock the account IDs.
const CASH_ACCOUNT_ID = 1; 
const AR_ACCOUNT_ID = 2; // Accounts Receivable
const EXPENSE_ACCOUNT_ID = 3;

class PaymentService {
  /**
   * Flow 2: Payment IN (Customer pays)
   * @param {Object} data - { invoiceId, amount, paymentMethodId, partyId }
   */
  async recordPaymentIn({ invoiceId, amount, paymentMethodId, partyId }) {
    if (amount <= 0) throw new Error("Amount must be greater than 0");

    return await prisma.$transaction(async (tx) => {
      // 1. Validate invoice
      const invoice = await tx.transaction.findUnique({ where: { id: invoiceId } });
      if (!invoice || invoice.type !== 'INVOICE') throw new Error("Invalid Invoice");

      // 2. Validate amount > 0 and <= dueAmount
      if (amount > Number(invoice.dueAmount)) {
        throw new Error("Cannot overpay invoice");
      }

      // 3. Create payment (type = IN)
      const payment = await tx.payment.create({
        data: {
          type: 'IN',
          amount,
          partyId: partyId || invoice.partyId,
          transactionId: invoiceId,
          paymentMethodId
        }
      });

      // 4. Update invoice: paidAmount & dueAmount
      const newPaidAmount = Number(invoice.paidAmount) + amount;
      const newDueAmount = Number(invoice.total) - newPaidAmount;
      const newStatus = newDueAmount === 0 ? 'COMPLETED' : 'PARTIALLY_PAID';

      await tx.transaction.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          status: newStatus
        }
      });

      // 5. Ledger: Double-entry (Debit Cash, Credit Accounts Receivable)
      const journal = await tx.journalEntry.create({
        data: {
          date: new Date(),
          description: `Payment IN for Invoice #${invoiceId}`,
          ledgerEntries: {
            create: [
              { accountId: CASH_ACCOUNT_ID, amount, type: 'DEBIT' },
              { accountId: AR_ACCOUNT_ID, amount, type: 'CREDIT' }
            ]
          }
        }
      });

      return { payment, journal };
    });
  }

  /**
   * Flow 3: Payment OUT (Expense / Vendor payment)
   * @param {Object} data - { partyId, amount, paymentMethodId }
   */
  async recordPaymentOut({ partyId, amount, paymentMethodId }) {
    if (amount <= 0) throw new Error("Amount must be greater than 0");

    return await prisma.$transaction(async (tx) => {
      // Create payment (type = OUT)
      const payment = await tx.payment.create({
        data: {
          type: 'OUT',
          amount,
          partyId,
          paymentMethodId
        }
      });

      // Ledger: Double-entry (Debit Expense, Credit Cash)
      const journal = await tx.journalEntry.create({
        data: {
          date: new Date(),
          description: `Payment OUT to Party #${partyId}`,
          ledgerEntries: {
            create: [
              { accountId: EXPENSE_ACCOUNT_ID, amount, type: 'DEBIT' },
              { accountId: CASH_ACCOUNT_ID, amount, type: 'CREDIT' }
            ]
          }
        }
      });

      return { payment, journal };
    });
  }
}

export default new PaymentService();
