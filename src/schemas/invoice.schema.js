import mongoose from "mongoose"
import { GLOBAL_STATUS_ENUM, SYSTEM_STATUSES } from "../constants/status.constants.js"
import { generateId } from "../utils/generateId.util.js"

// ---------------- ITEM ----------------
const invoiceItemSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service"
  },
  description: {
    type: String,
    trim: true
  },
  days: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerDay: {
    type: Number,
    min: 0
  },
  fixedPrice: {
    type: Number,
    min: 0
  },
  quotedPrice: {
    type: Number,
    min: 0
  },
  total: {
    type: Number,
    min: 0
  }
}, { _id: false })

// ---------------- MAIN ----------------
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true
  },

  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Party",
    required: true
  },

  quotation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quotation"
  },

  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event"
  },

  items: [invoiceItemSchema],

  totalAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },

  discountType: {
    type: String,
    enum: ["flat", "percent"],
    default: "flat"
  },

  finalAmount: { type: Number, default: 0 },

  taxPercent: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },

  grandTotal: { type: Number, default: 0 },

  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },

  status: {
    type: String,
    enum: GLOBAL_STATUS_ENUM,
    default: SYSTEM_STATUSES.PENDING
  },

  notes: String,
  dueDate: Date

}, { timestamps: true })

// ---------------- LOGIC ----------------
invoiceSchema.pre("save", async function () {

  // 1. Invoice number
  if (!this.invoiceNumber) {
    this.invoiceNumber = await generateId("Invoice", "INV")
  }

  // 2. Calculate items
  this.items.forEach(item => {
    if (item.quotedPrice != null) {
      item.total = item.quotedPrice
    } else if (item.pricePerDay != null) {
      item.total = item.days * item.pricePerDay
    } else if (item.fixedPrice != null) {
      item.total = item.fixedPrice
    } else {
      item.total = 0
    }
  })

  // 3. Subtotal
  this.totalAmount = this.items.reduce((sum, i) => sum + (i.total || 0), 0)

  // 4. Discount
  let discountAmount = 0

  if (this.discountType === "percent") {
    discountAmount = this.totalAmount * (this.discount / 100)
  } else {
    discountAmount = this.discount
  }

  if (discountAmount > this.totalAmount) {
    discountAmount = this.totalAmount
  }

  this.finalAmount = this.totalAmount - discountAmount

  // 5. Tax
  this.taxAmount = (this.finalAmount * this.taxPercent) / 100

  // 6. Grand total
  this.grandTotal = this.finalAmount + this.taxAmount

  // 7. Due
  this.dueAmount = this.grandTotal - (this.paidAmount || 0)

  if (this.dueAmount < 0) this.dueAmount = 0
})

// ---------------- INDEX ----------------
invoiceSchema.index({ customer: 1 })
invoiceSchema.index({ status: 1 })

export default mongoose.model("Invoice", invoiceSchema)