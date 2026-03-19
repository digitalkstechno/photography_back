import mongoose from "mongoose"

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Package name is required"],
    trim: true
  },
  price: {
    type: Number,
    required: [true, "Package price is required"],
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  includedServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service"
  }],
  customItems: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Auto-calculate package price before saving
packageSchema.pre("save", async function () {
  let total = 0;

  // 1. Sum up prices of included services
  if (this.includedServices && this.includedServices.length > 0) {
    const services = await mongoose.model("Service").find({
      _id: { $in: this.includedServices }
    }).lean();
    total += services.reduce((sum, s) => sum + (s.pricePerDay || 0), 0);
  }

  // 2. Sum up prices of custom items
  if (this.customItems && this.customItems.length > 0) {
    total += this.customItems.reduce((sum, item) => sum + (item.price || 0), 0);
  }

  // 3. Set the calculated price
  this.price = total;
})

export default mongoose.model("Package", packageSchema)
