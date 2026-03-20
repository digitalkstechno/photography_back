import { BaseService } from "../core/classbase.service.js";
import Invoice from "../schemas/invoice.schema.js";

import { quotationService } from "./quotation.service.js";
import { serviceService } from "./service.service.js";

class InvoiceService extends BaseService {
  constructor() {
    super(Invoice);
  }

  // -----------------------------------
  // POPULATE CONFIG
  // -----------------------------------
  getPopulate() {
    return [
      { path: "customer", select: "name phone email" },
      { path: "quotation", select: "totalAmount finalAmount status" },
      { path: "items.service", select: "name type pricePerDay" },
    ];
  }

  // -----------------------------------
  // FIND ALL
  // -----------------------------------
  async findAll(filter = {}) {
    return super.findAll(filter, {
      populate: this.getPopulate(),
      sort: { createdAt: -1 },
    });
  }

  // -----------------------------------
  // FIND BY ID
  // -----------------------------------
  async findById(id) {
    return super.findById(id, {
      populate: this.getPopulate(),
    });
  }

  // -----------------------------------
  // ITEM CALCULATION (CORE REUSABLE)
  // -----------------------------------
  async buildItems(rawItems = []) {
    const items = [];

    for (const item of rawItems) {
      const service = await serviceService.findById(item.service);
      if (!service) {
        throw Object.assign(
          new Error(`Service ${item.service} not found`),
          { status: 404 }
        );
      }

      const pricePerDay = item.pricePerDay || service.pricePerDay;
      const days = item.days || 1;

      items.push({
        service: service._id,
        description: item.description || service.name,
        days,
        pricePerDay,
        total: pricePerDay * days,
      });
    }

    return items;
  }

  // -----------------------------------
  // BEFORE CREATE HOOK
  // -----------------------------------
  async beforeCreate(data) {
    // Build items
    if (data.items) {
      data.items = await this.buildItems(data.items);
    }

    data.status = "DRAFT";
    return data;
  }

  // -----------------------------------
  // CREATE FROM QUOTATION
  // -----------------------------------
  async createFromQuotation(quotationId) {
    const quotation = await quotationService.findById(quotationId);
    if (!quotation) {
      throw Object.assign(new Error("Quotation not found"), {
        status: 404,
      });
    }

    const items = quotation.items.map((item) => ({
      service: item.service,
      description: item.description,
      days: item.days,
      pricePerDay: item.pricePerDay,
      total: item.total,
    }));

    const invoice = await this.create({
      customer: quotation.customer,
      quotation: quotation._id,
      items,
      discount: quotation.discount || 0,
      tax: 0,
      notes: quotation.notes,
    });

    // Update quotation
    await quotationService.update(quotationId, {
      status: "ACCEPTED",
    });

    return invoice;
  }

  // -----------------------------------
  // BEFORE UPDATE HOOK
  // -----------------------------------
  async beforeUpdate(data) {
    if (data.items) {
      data.items = await this.buildItems(data.items);
    }
    return data;
  }

  // -----------------------------------
  // UPDATE (OVERRIDE RULE)
  // -----------------------------------
  async update(id, data) {
    const existing = await this.findById(id);

    if (existing.status === "PAID") {
      throw Object.assign(
        new Error("Cannot edit a fully paid invoice"),
        { status: 400 }
      );
    }

    return super.update(id, data);
  }

  // -----------------------------------
  // DELETE (OVERRIDE RULE)
  // -----------------------------------
  async remove(id) {
    const existing = await this.findById(id);

    if (existing.status === "PAID") {
      throw Object.assign(
        new Error("Cannot delete a paid invoice"),
        { status: 400 }
      );
    }

    return super.remove(id);
  }

  // -----------------------------------
  // PAYMENT RECORDING (CORE)
  // -----------------------------------
  async recordPayment(invoiceId, amount) {
    const invoice = await this.model.findById(invoiceId);

    if (!invoice) return null;

    invoice.paidAmount = (invoice.paidAmount || 0) + amount;

    if (invoice.paidAmount >= invoice.grandTotal) {
      invoice.status = "PAID";
    } else if (invoice.paidAmount > 0) {
      invoice.status = "PARTIALLY_PAID";
    }

    await invoice.save();
    return invoice.toObject();
  }
}

export const invoiceService = new InvoiceService();