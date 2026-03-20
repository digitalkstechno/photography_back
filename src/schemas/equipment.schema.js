import mongoose from "mongoose"

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  category: {
    type: String,
    enum: ["CAMERA", "LENS", "DRONE", "LIGHTING", "AUDIO", "OTHER"],
    required: [true, "Category is required"]
  },
  serialNumber: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    enum: ["EXCELLENT", "GOOD", "FAIR", "POOR"],
    default: "GOOD"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

export default mongoose.model("Equipment", equipmentSchema)
