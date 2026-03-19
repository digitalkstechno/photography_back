import invoiceService from '../services/billing/invoice.service.js';
import paymentService from '../services/billing/payment.service.js';
import billingQueries from '../services/billing/billing.queries.js';

class BillingController {
  async createInvoice(req, res) {
    try {
      const invoice = await invoiceService.createInvoice(req.body);
      res.status(201).json({ success: true, data: invoice });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async recordPaymentIn(req, res) {
    try {
      const result = await paymentService.recordPaymentIn(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async recordPaymentOut(req, res) {
    try {
      const result = await paymentService.recordPaymentOut(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getDashboardStats(req, res) {
    try {
      const totalReceived = await billingQueries.getTotalReceived();
      const totalExpenses = await billingQueries.getTotalExpenses();
      const totalPending = await billingQueries.getTotalPending();
      
      res.status(200).json({
        success: true,
        data: {
          totalReceived,
          totalExpenses,
          totalPending
        }
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export default new BillingController();
