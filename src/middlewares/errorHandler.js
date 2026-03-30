/**
 * Formats database field names into human-readable titles.
 * @example 'customerName' -> 'Customer Name'
 * @example 'total_amount' -> 'Total Amount'
 */
const formatFieldName = (field) => {
  if (!field) return "Field";
  return field
    .replace(/([A-Z])/g, " $1") // Add space before caps
    .replace(/[_-]/g, " ")      // Replace underscores/hyphens with spaces
    .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize first letter
    .trim();
};

export const errorHandler = (err, req, res, next) => {
  // 1. Log for internal tracking
  if (process.env.NODE_ENV !== "test") {
    console.error("❌ ERROR OBJECT:", err);
  }

  // 2. Mongoose Validation Error (High-Precision)
  if (err.name === "ValidationError") {
    const errorData = {};
    const errorMessages = [];

    Object.keys(err.errors).forEach(key => {
      const fieldName = formatFieldName(key);
      const rawMsg = err.errors[key].message;
      
      // Clean Mongoose default messages
      const cleanMsg = rawMsg.replace(/Path `.*?` /i, "").replace(/Path /i, "");
      const finalMsg = `${fieldName}: ${cleanMsg}`;
      
      errorData[key] = finalMsg;
      errorMessages.push(finalMsg);
    });

    return res.status(400).json({
      success: false,
      message: `Invalid Data: ${errorMessages.join(". ")}`,
      errors: errorData
    });
  }

  // 3. Mongoose Cast Error (Invalid Format Description)
  if (err.name === "CastError") {
    const fieldName = formatFieldName(err.path);
    return res.status(400).json({
      success: false,
      message: `Data Format Error: The value '${err.value}' is not a valid format for ${fieldName}.`,
      errors: { [err.path]: "Invalid value format" }
    });
  }

  // 4. Mongoose Duplicate Key (Unique Constraint Insight)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const fieldName = formatFieldName(field);
    const value = err.keyValue[field];
    
    return res.status(409).json({
      success: false,
      message: `Conflict Detected: The ${fieldName} '${value}' is already in use. Please provide a unique value.`,
      errors: { [field]: "Duplicate value" }
    });
  }

  // 5. Handle Custom AppError or Standard Errors
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected server error occurred.";

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal Server Error" : message,
    errors: err.errors || null
  });
};