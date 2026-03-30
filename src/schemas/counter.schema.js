import mongoose from "mongoose";

/**
 * Counter Schema
 * Stores the last used sequence number for various entities (Invoice, Quotation, Booking).
 * This ensures atomic, unique, and sequential IDs.
 */
const counterSchema = new mongoose.Schema({
  _id: { 
    type: String, 
    required: true 
  }, // The name of the entity, e.g., "Invoice"
  seq: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

export default mongoose.model("Counter", counterSchema);
