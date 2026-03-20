import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    teamMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamMember",
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate assignment in same event
assignmentSchema.index(
  { teamMemberId: 1, eventId: 1 },
  { unique: true }
);

export default mongoose.model("Assignment", assignmentSchema);