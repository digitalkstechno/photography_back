import mongoose from "mongoose"
import { GLOBAL_STATUS_ENUM, SYSTEM_STATUSES } from "../constants/status.constants.js"

const invoiceItemSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true
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
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false })

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Party",
    required: [true, "Customer is required"]
  },
  eventId:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "Event"
  },
  quotation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quotation"
  },
  items: [invoiceItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  finalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  grandTotal: {
    type: Number,
    default: 0,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: GLOBAL_STATUS_ENUM,
    default: SYSTEM_STATUSES.PENDING
  },
  notes: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date
  }
}, {
  timestamps: true
})

// Auto-generate invoice number before save
invoiceSchema.pre("save", async function () {
  if (!this.invoiceNumber) {
    const count = await mongoose.model("Invoice").countDocuments()
    const num = (count + 1).toString().padStart(4, "0")
    this.invoiceNumber = `INV-${num}`
  }
  // Auto-calculate totals
  this.totalAmount = this.items.reduce((sum, item) => sum + item.total, 0)
  this.finalAmount = this.totalAmount - (this.discount || 0)
  this.grandTotal = this.finalAmount + (this.tax || 0)
})

invoiceSchema.index({ customer: 1 })
invoiceSchema.index({ status: 1 })

export default mongoose.model("Invoice", invoiceSchema)
