import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class BillingQueries {
  async getTotalReceived() {
    const result = await prisma.payment.aggregate({
      where: { type: 'IN' },
      _sum: { amount: true }
    });
    return result._sum.amount || 0;
  }

  async getTotalExpenses() {
    const result = await prisma.payment.aggregate({
      where: { type: 'OUT' },
      _sum: { amount: true }
    });
    return result._sum.amount || 0;
  }

  async getTotalPending() {
    const result = await prisma.transaction.aggregate({
      where: { 
        type: 'INVOICE',
        status: { in: ['DRAFT', 'CONFIRMED', 'PARTIALLY_PAID'] } 
      },
      _sum: { dueAmount: true }
    });
    return result._sum.dueAmount || 0;
  }
}

export default new BillingQueries();
