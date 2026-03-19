import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema({
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Party",
    required: [true, "Party is required"]
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event"
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice"
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: 0.01
  },
  type: {
    type: String,
    enum: ["IN", "OUT"],
    required: [true, "Payment type is required"]
  },
  mode: {
    type: String,
    enum: ["CASH", "UPI", "BANK", "CHEQUE", "OTHER"],
    default: "CASH"
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },
  reference: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

paymentSchema.index({ party: 1, date: -1 })
paymentSchema.index({ type: 1 })

export default mongoose.model("Payment", paymentSchema)
