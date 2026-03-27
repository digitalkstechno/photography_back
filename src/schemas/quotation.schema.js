import mongoose from "mongoose"
import { GLOBAL_STATUS_ENUM, SYSTEM_STATUSES } from "../constants/status.constants.js"
import { generateId } from "../utils/generateId.util.js"

const quotationItemSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true
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
  },
  source: {
    type: String,
    default: "Individual"
  }
}, { _id: false })

const quotationSchema = new mongoose.Schema({
  quotationNumber: {
    type: String,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Party",
    required: [true, "Customer is required"]
  },
  items: [quotationItemSchema],
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
  status: {
    type: String,
    enum: GLOBAL_STATUS_ENUM,
    default: SYSTEM_STATUSES.DRAFT
  },
  notes: {
    type: String,
    trim: true
  },
  terms: {
    type: String,
    trim: true
  },
  validUntil: {
    type: Date
  },
  convertedToEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event"
  }
}, {
  timestamps: true
})

// Auto-calculate totals and generate number before save
quotationSchema.pre("save", async function () {
  if (!this.quotationNumber) {
    this.quotationNumber = await generateId("Quotation", "QT")
  }
  
  this.totalAmount = this.items.reduce((sum, item) => sum + item.total, 0)
  this.finalAmount = (this.totalAmount || 0) - (this.discount || 0)
  this.grandTotal = (this.finalAmount || 0) + (this.tax || 0)
})

quotationSchema.index({ quotationNumber: 1 })
quotationSchema.index({ customer: 1 })
quotationSchema.index({ status: 1 })

export default mongoose.model("Quotation", quotationSchema)
