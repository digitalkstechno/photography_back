import mongoose from "mongoose";

/**
 * Universal Account Schema
 * Tracks different pools of money (Cash, Bank, Wallets, etc.)
 * This allows the business to manage multiple payment sources in a unified way.
 */
const accountSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Account name is required"], 
    trim: true,
    unique: true
  },
  type: { 
    type: String, 
    enum: ["CASH", "BANK", "WALLET", "CREDIT", "OTHER"],
    default: "BANK"
  },
  accountNumber: { 
    type: String, 
    trim: true 
  },
  bankName: { 
    type: String, 
    trim: true 
  },
  initialBalance: { 
    type: Number, 
    default: 0 
  },
  currentBalance: { 
    type: Number, 
    default: 0 
  },
  description: { 
    type: String, 
    trim: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Pre-save to initialize currentBalance if not set
accountSchema.pre("save", function (next) {
  if (this.isNew && this.currentBalance === 0) {
    this.currentBalance = this.initialBalance;
  }
  next();
});

export default mongoose.model("Account", accountSchema);
