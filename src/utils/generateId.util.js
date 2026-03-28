import mongoose from "mongoose";

/**
 * Generates an auto-incremented ID for a given Mongoose model.
 * 
 * @param {string} modelName - The name of the Mongoose model (e.g., "Invoice", "Event").
 * @param {string} prefix - The prefix string to append before the number (e.g., "INV", "BKG").
 * @param {number} padLength - The number of digits for padding (default is 4).
 * @returns {Promise<string>} The generated ID string (e.g., "INV-0001").
 */
export const generateId = async (modelName, prefix, padLength = 4) => {
  const model = mongoose.model(modelName);

  if (modelName === "Quotation") {
    const year = new Date().getFullYear();
    let unique = false;
    let finalId = "";
    while (!unique) {
      const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random
      finalId = `QT-${year}-${randomNum}`;
      const existing = await model.findOne({ quotationNumber: finalId });
      if (!existing) unique = true;
    }
    return finalId;
  }

  const count = await model.countDocuments();
  const num = (count + 1).toString().padStart(padLength, "0");
  return `${prefix}-${num}`;
};
