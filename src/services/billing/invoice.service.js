import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class InvoiceService {
  /**
   * Flow 1: Create Invoice
   * @param {Object} data - { partyId, total, notes, items }
   */
  async createInvoice(data) {
    const { partyId, total, notes, items } = data;
    
    // Create the transaction acting as an Invoice
    const invoice = await prisma.transaction.create({
      data: {
        partyId,
        type: 'INVOICE',
        status: 'PENDING', // PENDING is typically mapped to DRAFT or CONFIRMED; using CONFIRMED based on updated schema or DRAFT.
        // Actually since we didn't add PENDING explicitly to the enum, let's use DRAFT/CONFIRMED instead.
        // As per user spec originally: PENDING. Let's assume DRAFT = PENDING.
        status: 'DRAFT', 
        total,
        paidAmount: 0,
        dueAmount: total,
        notes,
        // Optional: mapping items if provided
        items: items?.length ? {
          create: items.map(i => ({
            itemId: i.itemId,
            quantity: i.quantity,
            price: i.price,
            total: i.quantity * i.price
          }))
        } : undefined
      }
    });

    return invoice;
  }
}

export default new InvoiceService();
