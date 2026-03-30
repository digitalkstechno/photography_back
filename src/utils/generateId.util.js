import mongoose from "mongoose";
import Counter from "../schemas/counter.schema.js";

/**
 * Generates an auto-incremented ID for a given Mongoose model.
 * Uses atomic increments via a shared Counter collection to prevent duplicates.
 * 
 * @param {string} modelName - The name of the Mongoose model (e.g., "Invoice", "Event").
 * @param {string} prefix - The prefix string to append before the number (e.g., "INV", "BKG").
 * @param {number} padLength - The number of digits for padding (default is 4).
 * @returns {Promise<string>} The generated ID string (e.g., "INV-0001").
 */
export const generateId = async (modelName, prefix, padLength = 4) => {
  // 1. Get the atomic increment
  let counter = await Counter.findOneAndUpdate(
    { _id: modelName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  // 2. Initial Migration Check
  // If the counter was just created (seq === 1), check if we have existing records
  // and jump the sequence to the highest count to prevent collisions with old data.
  if (counter.seq === 1) {
    const model = mongoose.model(modelName);
    const count = await model.countDocuments();
    if (count > 0) {
      counter = await Counter.findOneAndUpdate(
        { _id: modelName },
        { seq: count + 1 }, // Start after the current count
        { new: true }
      );
    }
  }

  const num = counter.seq.toString().padStart(padLength, "0");
  return `${prefix}-${num}`;
};
