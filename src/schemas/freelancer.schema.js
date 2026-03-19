import mongoose from "mongoose"

const freelancerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  skill: {
    type: String,
    enum: ["CANDID", "VIDEO", "DRONE", "DSLR", "EDITOR", "OTHER"],
    required: [true, "Skill is required"]
  },
  chargePerDay: {
    type: Number,
    required: [true, "Charge per day is required"],
    min: 0
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

export default mongoose.model("Freelancer", freelancerSchema)
