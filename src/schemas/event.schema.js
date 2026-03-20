import mongoose from "mongoose"

const eventSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Party",
    required: [true, "Customer is required"]
  },
  quotation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quotation"
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice"
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package"
  },
  eventType: {
    type: String,
    enum: ["WEDDING", "HALDI", "MEHNDI", "SANGEET", "RECEPTION", "ENGAGEMENT", "BIRTHDAY", "CORPORATE", "OTHER"],
    required: [true, "Event type is required"]
  },
  title: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"]
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"]
  },
  location: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ["PLANNED", "CONFIRMED", "COMPLETED", "CANCELLED"],
    default: "PLANNED",
  },
}, {
  timestamps: true
})

// -------------------------------
// 🔥 VALIDATION (IMPORTANT)
// -------------------------------
eventSchema.pre("save", function (next) {
  if (this.startDate > this.endDate) {
    return next(new Error("Start date cannot be after end date"));
  }
  next();
});


// -------------------------------
// 🔥 INDEXES (PERFORMANCE)
// -------------------------------
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ customer: 1 });
eventSchema.index({ status: 1 });
export default mongoose.model("Event", eventSchema)
