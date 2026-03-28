import mongoose from "mongoose"
import { GLOBAL_STATUS_ENUM, SYSTEM_STATUSES } from "../constants/status.constants.js"
import { generateId } from "../utils/generateId.util.js"

// -------------------------------
// ITEM SCHEMA
// -------------------------------
const quotationItemSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service"
  },
  name: {
    type: String,
    trim: true
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
    type: Number, // manual override
    min: 0
  },
  total: {
    type: Number,
    min: 0
  },
  source: {
    type: String,
    enum: ["Individual", "Package", "Custom"],
    default: "Individual"
  }
}, { _id: false })

// -------------------------------
// MAIN SCHEMA
// -------------------------------
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

  discountType: {
    type: String,
    enum: ["flat", "percent"],
    default: "flat"
  },

  finalAmount: {
    type: Number,
    default: 0,
    min: 0
  },

  taxPercent: {
    type: Number,
    default: 0,
    min: 0
  },

  taxAmount: {
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
  },

  isLocked: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
})

// -------------------------------
// AUTO CALCULATION LOGIC
// -------------------------------
quotationSchema.pre("save", async function () {

  // Generate quotation number
  if (!this.quotationNumber) {
    this.quotationNumber = await generateId("Quotation", "QT")
  }

  // 1. Calculate item totals
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

  // 2. Subtotal
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.total || 0), 0)

  // 3. Discount
  let discountAmount = 0

  if (this.discountType === "percent") {
    discountAmount = this.totalAmount * (this.discount / 100)
  } else {
    discountAmount = this.discount
  }

  // Prevent over-discount
  if (discountAmount > this.totalAmount) {
    discountAmount = this.totalAmount
  }

  this.finalAmount = this.totalAmount - discountAmount

  // 4. Tax (GST)
  this.taxAmount = (this.finalAmount * this.taxPercent) / 100

  // 5. Grand Total
  this.grandTotal = this.finalAmount + this.taxAmount
})

// -------------------------------
// INDEXES
// -------------------------------
quotationSchema.index({ quotationNumber: 1 })
quotationSchema.index({ customer: 1 })
quotationSchema.index({ status: 1 })

export default mongoose.model("Quotation", quotationSchema)