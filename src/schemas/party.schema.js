import mongoose from "mongoose"

const partySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  gst: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  partyType: {
    type: String,
    enum: ["CUSTOMER", "VENDOR", "BOTH"],
    default: "CUSTOMER"
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Index for search
partySchema.index({ name: "text", phone: "text", email: "text" })

export default mongoose.model("Party", partySchema)
