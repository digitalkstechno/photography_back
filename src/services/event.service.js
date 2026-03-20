import { BaseService } from "../core/classbase.service.js";
import Event from "../schemas/event.schema.js";
import { invoiceService } from "./invoice.service.js";

class EventService extends BaseService {
  constructor() {
    super(Event);
  }

  // -----------------------------------
  // DEFAULT POPULATE CONFIG
  // -----------------------------------
  getDefaultPopulate() {
    return [
      { path: "customer", select: "name phone email" },
      { path: "quotation", select: "totalAmount finalAmount status" },
      { path: "invoice", select: "invoiceNumber grandTotal status paidAmount" },
      { path: "package", select: "name price" },
      { path: "assignments.user", select: "name email phone role" },
      { path: "assignments.freelancer", select: "name skill chargePerDay phone" },
      { path: "assignments.equipments", select: "name category serialNumber" },
    ];
  }

  // -----------------------------------
  // FIND ALL
  // -----------------------------------
  async findAll(filter = {}) {
    return super.findAll(filter, {
      populate: this.getDefaultPopulate(),
      sort: { startDate: -1 },
    });
  }

  // -----------------------------------
  // FIND BY ID
  // -----------------------------------
  async findById(id) {
    return super.findById(id, {
      populate: [
        ...this.getDefaultPopulate(),
        { path: "invoice", select: "invoiceNumber grandTotal status paidAmount items" },
        { path: "assignments.equipments", select: "name category serialNumber condition" },
      ],
    });
  }

  // -----------------------------------
  // BEFORE CREATE HOOK
  // -----------------------------------
  async beforeCreate(data) {
    // 🔥 Inject from invoice
    if (data.invoice) {
      const invoice = await invoiceService.getById(data.invoice);

      if (invoice) {
        data.customer = data.customer || invoice.customer;
        data.totalAmount = data.totalAmount || invoice.grandTotal;
      }
    }

    // 🔥 Check availability
    if (data.startDate && data.endDate) {
      const conflict = await this.checkAvailabilityInternal(
        data.startDate,
        data.endDate
      );

      if (conflict && !data.overrideConflicts) {
        throw Object.assign(
          new Error(
            `Date conflict with "${conflict.eventType}" (${this.formatDate(
              conflict.startDate
            )} – ${this.formatDate(conflict.endDate)})`
          ),
          { status: 409, conflict: true }
        );
      }
    }

    return data;
  }

  // -----------------------------------
  // BEFORE UPDATE HOOK
  // -----------------------------------
  async beforeUpdate(data) {
    if (data.startDate && data.endDate) {
      const conflict = await this.checkAvailabilityInternal(
        data.startDate,
        data.endDate,
        data._id
      );

      if (conflict && !data.overrideConflicts) {
        throw Object.assign(
          new Error(
            `Date conflict with "${conflict.eventType}" (${this.formatDate(
              conflict.startDate
            )})`
          ),
          { status: 409, conflict: true }
        );
      }
    }

    delete data.overrideConflicts;
    return data;
  }

  // -----------------------------------
  // STATUS UPDATE
  // -----------------------------------
  async updateStatus(id, status) {
    return super.update(id, { status });
  }

  // -----------------------------------
  // AVAILABILITY (PUBLIC)
  // -----------------------------------
  async checkAvailability(startDate, endDate) {
    const conflicts = await this.model
      .find({
        status: { $ne: "CANCELLED" },
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) },
      })
      .populate("customer", "name")
      .lean();

    return {
      available: conflicts.length === 0,
      conflicts,
    };
  }

  // -----------------------------------
  // INTERNAL AVAILABILITY CHECK
  // -----------------------------------
  async checkAvailabilityInternal(startDate, endDate, excludeId = null) {
    const query = {
      status: { $ne: "CANCELLED" },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    return this.model.findOne(query).lean();
  }

  // -----------------------------------
  // UTIL
  // -----------------------------------
  formatDate(date) {
    return new Date(date).toISOString().split("T")[0];
  }
}

export const eventService = new EventService();