import mongoose from "mongoose";

/**
 * Universal Expense Schema
 * Specialized for business overheads and non-invoice payments.
 * Every Expense creation should trigger a Transaction entry in the Ledger.
 */
const expenseSchema = new mongoose.Schema({
  expenseNumber: { 
    type: String, 
    unique: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0.01 
  },
  category: { 
    type: String, 
    required: true, 
    trim: true,
    enum: ["RENT", "ELECTRICITY", "TEA_COFFEE", "INTERNET", "TRAVEL", "EQUIPMENT_MAINTENANCE", "MARKETING", "SALARY", "FREELANCE_PAYOUT", "OTHER"],
    default: "OTHER"
  },
  account: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Account", 
    required: true 
  }, // Which account paid the bill?
  party: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Party" 
  }, // Who was paid?
  reference: { 
    type: String, 
    trim: true 
  }, // Bill/Invoice No
  notes: { 
    type: String, 
    trim: true 
  },
  billImage: { 
    type: String 
  } // URL/Path to receipt image
}, { timestamps: true });

export default mongoose.model("Expense", expenseSchema);
