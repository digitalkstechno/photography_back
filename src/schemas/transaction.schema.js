import mongoose from "mongoose";

/**
 * Universal Transaction Schema
 * The final source of truth for all money movements (Income, Expense, Transfer).
 * Automatically updates the currentBalance of any linked Account.
 */
const transactionSchema = new mongoose.Schema({
  transactionId: { 
    type: String, 
    unique: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  type: { 
    type: String, 
    enum: ["INCOME", "EXPENSE", "TRANSFER"],
    required: true
  },
  amount: { 
    type: Number, 
    required: [true, "Amount is required"], 
    min: 0.01 
  },
  account: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Account", 
    required: true 
  },
  toAccount: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Account" 
  }, // For Transfers
  category: { 
    type: String, 
    trim: true,
    default: "Other"
  },
  party: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Party" 
  }, // Customer, Vendor, etc.
  reference: { 
    type: String, 
    trim: true 
  }, // Bill number, Cheque No, etc.
  notes: { 
    type: String, 
    trim: true 
  },
  isAutomatic: { 
    type: Boolean, 
    default: false 
  } // Logged automatically by Invoice/Payment
}, { timestamps: true });

// Pre-save to update account balances
transactionSchema.pre("save", async function (next) {
  const Account = mongoose.model("Account");

  // 1. Handle Income/Expense
  if (this.type === "INCOME") {
    await Account.findByIdAndUpdate(this.account, { $inc: { currentBalance: this.amount } });
  } else if (this.type === "EXPENSE") {
    await Account.findByIdAndUpdate(this.account, { $inc: { currentBalance: -this.amount } });
  } else if (this.type === "TRANSFER") {
    if (!this.toAccount) throw new Error("Target account is required for transfers");
    await Account.findByIdAndUpdate(this.account, { $inc: { currentBalance: -this.amount } });
    await Account.findByIdAndUpdate(this.toAccount, { $inc: { currentBalance: this.amount } });
  }

  next();
});

export default mongoose.model("Transaction", transactionSchema);
