import Invoice from "../schemas/invoice.schema.js";
import Quotation from "../schemas/quotation.schema.js";
import AppError from "../utils/AppError.js";

// ---------------- CALCULATOR (SOURCE OF TRUTH) ----------------
const calculateInvoice = (data) => {
  let totalAmount = 0;

  const items = (data.items || []).map(item => {
    const days = Number(item.days) || 0;
    
    let total = 0;

    // Use specific checks for null to avoid Number(null) == 0 bug
    if (item.quotedPrice != null) {
      total = Number(item.quotedPrice);
    } else if (item.pricePerDay != null) {
      total = days * Number(item.pricePerDay);
    } else if (item.fixedPrice != null) {
      total = Number(item.fixedPrice);
    }

    totalAmount += total;

    return {
      description: item.name || item.description || "",
      days,
      pricePerDay: item.pricePerDay,
      fixedPrice: item.fixedPrice,
      quotedPrice: item.quotedPrice,
      total
    };
  });

  const discount = Number(data.discount) || 0;
  const discountType = data.discountType || "flat";

  let discountAmount =
    discountType === "percent"
      ? (totalAmount * discount) / 100
      : discount;

  if (discountAmount > totalAmount) discountAmount = totalAmount;

  const finalAmount = totalAmount - discountAmount;

  const taxPercent = Number(data.taxPercent) || 0;
  const taxAmount = (finalAmount * taxPercent) / 100;

  const grandTotal = finalAmount + taxAmount;

  const paidAmount = Number(data.paidAmount) || 0;
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  // 🔥 Auto status logic
  let status = "PENDING";
  if (paidAmount > 0 && paidAmount < grandTotal) status = "PARTIALLY_PAID";
  if (paidAmount >= grandTotal) status = "PAID";

  return {
    items,
    totalAmount,
    discountAmount,
    taxAmount,
    grandTotal,
    dueAmount,
    status
  };
};

// ---------------- SANITIZE ----------------
const sanitize = (payload) => {
  const clean = { ...payload };

  delete clean.totalAmount;
  delete clean.discountAmount;
  delete clean.taxAmount;
  delete clean.grandTotal;
  delete clean.dueAmount;
  delete clean.status;

  return clean;
};

// ---------------- SERVICE ----------------
export const invoiceService = {

  // -------- GET ALL --------
  async findAll(filter = {}, query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const data = await Invoice.find(filter)
      .populate("customer", "name phone email address")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Invoice.countDocuments(filter);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // -------- GET ONE --------
  async findById(id) {
    return await Invoice.findById(id)
      .populate("customer", "name phone email address")
      .populate("items.service", "name type");
  },

  // -------- CREATE --------
  async create(payload) {
    if (!payload.customer) {
      throw new AppError("Customer is required to generate an invoice", 400, { customer: "Missing" });
    }

    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new AppError("At least one service/item must be added", 400, { items: "Required" });
    }

    const clean = sanitize(payload);
    const calc = calculateInvoice(clean);

    const invoice = await Invoice.create({
      ...clean,
      ...calc
    });

    return invoice;
  },

  // -------- CREATE FROM QUOTATION --------
  async createFromQuotation(quotationId) {
    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      throw new AppError("Quotation not found. Please verify the link.", 404);
    }

    const payload = {
      customer: quotation.customer,
      items: quotation.items,
      discount: quotation.discount || 0,
      discountType: quotation.discountType || "flat",
      taxPercent: quotation.taxPercent || 0,
      paidAmount: 0,
      notes: quotation.notes || ""
    };

    const calc = calculateInvoice(payload);

    const invoice = await Invoice.create({
      ...payload,
      ...calc,
      quotation: quotation._id
    });

    return invoice;
  },

  // -------- UPDATE --------
  async update(id, payload) {
    const clean = sanitize(payload);
    const calc = calculateInvoice(clean);

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { ...clean, ...calc },
      { new: true }
    );

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    return invoice;
  },

  // -------- RECORD PAYMENT --------
  async recordPayment(id, amount) {
    const invoice = await Invoice.findById(id);
    if (!invoice) throw new AppError("Invoice not found", 404);

    invoice.paidAmount = (invoice.paidAmount || 0) + Number(amount);
    await invoice.save();

    return invoice;
  },

  // -------- DELETE --------
  async remove(id) {
    const invoice = await Invoice.findByIdAndDelete(id);

    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    return true;
  }

};