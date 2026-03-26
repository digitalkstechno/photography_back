import mongoose from "mongoose"
import { GLOBAL_STATUS_ENUM, SYSTEM_STATUSES } from "../constants/status.constants.js"

const assignmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Freelancer"
  },
  role: {
    type: String,
    enum: ["CANDID", "VIDEO", "DRONE", "DSLR", "EDITOR", "ASSISTANT", "OTHER"],
    required: true
  },
  chargePerDay: {
    type: Number,
    min: 0,
    default: 0
  },
  days: {
    type: Number,
    min: 1,
    default: 1
  },
  totalCharge: {
    type: Number,
    min: 0,
    default: 0
  }
}, { _id: false })

const jobSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: [true, "Event is required"]
  },
  assignedUsers: [assignmentSchema],
  status: {
    type: String,
    enum: GLOBAL_STATUS_ENUM,
    default: SYSTEM_STATUSES.PENDING
  },
  notes: {
    type: String,
    trim: true
  },
  totalCost: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
})

// Auto-calculate total cost before save
jobSchema.pre("save", function () {
  this.totalCost = this.assignedUsers.reduce((sum, a) => sum + (a.totalCharge || 0), 0)
})

export default mongoose.model("Job", jobSchema)
