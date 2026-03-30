import Invoice from "../schemas/invoice.schema.js";
import Quotation from "../schemas/quotation.schema.js";

// ---------------- CALCULATOR (SOURCE OF TRUTH) ----------------
const calculateInvoice = (data) => {
  let subtotal = 0;

  const items = (data.items || []).map(item => {
    const days = Number(item.days) || 0;
    const price = Number(item.pricePerDay);
    const fixed = Number(item.fixedPrice);
    const quoted = Number(item.quotedPrice);

    let total = 0;

    if (!isNaN(quoted)) {
      total = quoted;
    } else if (!isNaN(price)) {
      total = days * price;
    } else if (!isNaN(fixed)) {
      total = fixed;
    }

    subtotal += total;

    return {
      description: item.name || item.description || "",
      days,
      pricePerDay: isNaN(price) ? null : price,
      fixedPrice: isNaN(fixed) ? null : fixed,
      quotedPrice: isNaN(quoted) ? null : quoted,
      total
    };
  });

  const discount = Number(data.discount) || 0;
  const discountType = data.discountType || "flat";

  let discountAmount =
    discountType === "percent"
      ? (subtotal * discount) / 100
      : discount;

  if (discountAmount > subtotal) discountAmount = subtotal;

  const finalAmount = subtotal - discountAmount;

  const taxPercent = Number(data.taxPercent) || 0;
  const taxAmount = (finalAmount * taxPercent) / 100;

  const grandTotal = finalAmount + taxAmount;

  const paidAmount = Number(data.paidAmount) || 0;
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  // 🔥 Auto status logic
  let status = "PENDING";
  if (paidAmount > 0 && paidAmount < grandTotal) status = "PARTIAL";
  if (paidAmount >= grandTotal) status = "PAID";

  return {
    items,
    subtotal,
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

  delete clean.subtotal;
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
      throw new Error("Customer is required");
    }

    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error("At least one item is required");
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
    console.log(quotation);
    if (!quotation) {
      throw new Error("Quotation not found");
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
      quotationId: quotation._id
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

  // -------- DELETE --------
  async remove(id) {
    const invoice = await Invoice.findByIdAndDelete(id);

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    return true;
  }

};