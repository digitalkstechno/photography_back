import mongoose from "mongoose"

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Service name is required"],
    trim: true
  },
  pricePerDay: {
    type: Number,
    required: [true, "Price per day is required"],
    min: 0
  },
  type: {
    type: String,
    enum: ["PHOTO", "VIDEO"],
    required: [true, "Service type is required"]
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.model("Service", serviceSchema)
