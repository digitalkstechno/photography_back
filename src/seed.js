import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "./schemas/user.schema.js";
import Party from "./schemas/party.schema.js";
import Service from "./schemas/service.schema.js";
import Package from "./schemas/package.schema.js";
import Freelancer from "./schemas/freelancer.schema.js";
import Quotation from "./schemas/quotation.schema.js";
import Invoice from "./schemas/invoice.schema.js";
import Event from "./schemas/event.schema.js";
import Job from "./schemas/job.schema.js";
import Payment from "./schemas/payment.schema.js";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = "mongodb+srv://photo:23XamLihXQ18bfb4@digitalks.emxt3a4.mongodb.net/photography_studio";
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    // Clear all
    await Promise.all([
      User.deleteMany(), Party.deleteMany(), Service.deleteMany(),
      Package.deleteMany(), Freelancer.deleteMany(), Quotation.deleteMany(),
      Invoice.deleteMany(), Event.deleteMany(), Job.deleteMany(), Payment.deleteMany()
    ]);
    console.log("Existing data cleared...");

    // ── 1. USERS ──
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);
    const [adminUser, staffUser] = await User.insertMany([
      { name: "Admin User", email: "admin@example.com", password: hashedPassword, phone: "9876543210", role: "ADMIN" },
      { name: "Staff Member", email: "staff@example.com", password: hashedPassword, phone: "9876543211", role: "STAFF" }
    ]);
    console.log("✓ Users");

    // ── 2. PARTIES ──
    const [cust1, cust2, cust3, vendor1] = await Party.insertMany([
      { name: "Raj & Priya Sharma", phone: "9001234567", email: "raj.sharma@email.com", address: "45 MG Road, Jaipur", partyType: "CUSTOMER" },
      { name: "Amit & Neha Gupta", phone: "9001234568", email: "amit.gupta@email.com", address: "12 Gandhi Nagar, Delhi", partyType: "CUSTOMER" },
      { name: "Vikram Singh", phone: "9001234569", email: "vikram@email.com", address: "78 Civil Lines, Lucknow", partyType: "CUSTOMER" },
      { name: "Lens Rental House", phone: "9009876543", email: "info@lensrental.com", address: "Camera Market, Delhi", partyType: "VENDOR" }
    ]);
    console.log("✓ Parties");

    // ── 3. SERVICES ──
    const [svcCandid, svcVideo, svcDrone] = await Service.insertMany([
      { name: "Candid Photography", pricePerDay: 15000, type: "PHOTO", description: "Professional candid photography" },
      { name: "Cinematic Video", pricePerDay: 25000, type: "VIDEO", description: "High quality cinematic wedding film" },
      { name: "Drone Coverage", pricePerDay: 10000, type: "VIDEO", description: "Aerial drone shots" }
    ]);
    console.log("✓ Services");

    // ── 4. PACKAGES ──
    const [pkgPremium, pkgBasic] = await Package.insertMany([
      { name: "Premium Wedding Package", price: 85000, description: "2 days: Candid + Video + Drone", includedServices: [svcCandid._id, svcVideo._id, svcDrone._id] },
      { name: "Basic Engagement Package", price: 25000, description: "1 day: Candid Photography", includedServices: [svcCandid._id] }
    ]);
    console.log("✓ Packages");

    // ── 5. FREELANCERS ──
    const [flRahul, flAmit] = await Freelancer.insertMany([
      { name: "Rahul Sharma", phone: "9988776655", email: "rahul.photo@email.com", skill: "CANDID", chargePerDay: 8000 },
      { name: "Amit Patel", phone: "9988776644", email: "amit.video@email.com", skill: "VIDEO", chargePerDay: 12000 }
    ]);
    console.log("✓ Freelancers");

    // ══════════════════════════════════════════════════════════
    // ORDER 1: FULLY PAID — Raj & Priya Wedding
    // Quotation(CONVERTED) → Invoice(PAID) → Event(COMPLETED) → Job(COMPLETED) → Payments
    // ══════════════════════════════════════════════════════════

    const quot1 = new Quotation({
      customer: cust1._id,
      items: [
        { service: svcCandid._id, days: 2, pricePerDay: 15000, total: 30000 },
        { service: svcVideo._id, days: 2, pricePerDay: 25000, total: 50000 },
        { service: svcDrone._id, days: 1, pricePerDay: 10000, total: 10000 }
      ],
      discount: 5000,
      status: "CONVERTED",
      notes: "Premium wedding package",
      validUntil: new Date(Date.now() + 30 * 86400000)
    });
    await quot1.save();

    const inv1 = new Invoice({
      customer: cust1._id,
      quotation: quot1._id,
      items: [
        { service: svcCandid._id, description: "Candid Photography", days: 2, pricePerDay: 15000, total: 30000 },
        { service: svcVideo._id, description: "Cinematic Video", days: 2, pricePerDay: 25000, total: 50000 },
        { service: svcDrone._id, description: "Drone Coverage", days: 1, pricePerDay: 10000, total: 10000 }
      ],
      discount: 5000,
      tax: 0,
      paidAmount: 85000,
      status: "PAID",
      notes: "Raj & Priya Wedding — Fully Paid"
    });
    await inv1.save();

    const pastStart = new Date(Date.now() - 10 * 86400000);
    const pastEnd = new Date(Date.now() - 8 * 86400000);

    const event1 = await Event.create({
      customer: cust1._id, quotation: quot1._id, invoice: inv1._id,
      package: pkgPremium._id, eventType: "WEDDING",
      title: "Raj & Priya Wedding", startDate: pastStart, endDate: pastEnd,
      location: "Grand Rajputana Palace, Jaipur", status: "COMPLETED", totalAmount: 85000
    });

    quot1.convertedToEvent = event1._id;
    await quot1.save();

    const job1 = new Job({
      event: event1._id,
      assignedUsers: [
        { freelancer: flRahul._id, role: "CANDID", chargePerDay: 8000, days: 2, totalCharge: 16000 },
        { freelancer: flAmit._id, role: "VIDEO", chargePerDay: 12000, days: 2, totalCharge: 24000 }
      ],
      status: "COMPLETED"
    });
    await job1.save();

    await Payment.insertMany([
      { party: cust1._id, event: event1._id, invoice: inv1._id, amount: 30000, type: "IN", mode: "BANK", date: new Date(pastStart.getTime() - 7 * 86400000), description: "Advance", reference: "NEFT-001" },
      { party: cust1._id, event: event1._id, invoice: inv1._id, amount: 55000, type: "IN", mode: "UPI", date: pastEnd, description: "Final payment", reference: "UPI-002" },
      { party: vendor1._id, event: event1._id, amount: 5000, type: "OUT", mode: "CASH", date: pastEnd, description: "Lens rental" },
      { party: vendor1._id, event: event1._id, amount: 40000, type: "OUT", mode: "BANK", date: new Date(pastEnd.getTime() + 2 * 86400000), description: "Freelancer team payment" }
    ]);

    console.log("✓ Order 1 (PAID) — Raj & Priya Wedding");

    // ══════════════════════════════════════════════════════════
    // ORDER 2: MID-FLOW — Amit & Neha Engagement
    // Quotation(CONVERTED) → Invoice(PARTIALLY_PAID) → Event(CONFIRMED) → Job assigned
    // ══════════════════════════════════════════════════════════

    const quot2 = new Quotation({
      customer: cust2._id,
      items: [
        { service: svcCandid._id, days: 1, pricePerDay: 15000, total: 15000 },
        { service: svcVideo._id, days: 1, pricePerDay: 25000, total: 25000 }
      ],
      discount: 2000,
      status: "CONVERTED",
      notes: "Engagement coverage",
      validUntil: new Date(Date.now() + 30 * 86400000)
    });
    await quot2.save();

    const inv2 = new Invoice({
      customer: cust2._id,
      quotation: quot2._id,
      items: [
        { service: svcCandid._id, description: "Candid Photography", days: 1, pricePerDay: 15000, total: 15000 },
        { service: svcVideo._id, description: "Cinematic Video", days: 1, pricePerDay: 25000, total: 25000 }
      ],
      discount: 2000,
      paidAmount: 15000,
      status: "PARTIALLY_PAID",
      notes: "Engagement — advance received"
    });
    await inv2.save();

    const futureDate = new Date(Date.now() + 5 * 86400000);
    const event2 = await Event.create({
      customer: cust2._id, quotation: quot2._id, invoice: inv2._id,
      package: pkgBasic._id, eventType: "ENGAGEMENT",
      title: "Amit & Neha Engagement", startDate: futureDate, endDate: futureDate,
      location: "The Lalit, New Delhi", status: "CONFIRMED", totalAmount: 38000
    });

    quot2.convertedToEvent = event2._id;
    await quot2.save();

    const job2 = new Job({
      event: event2._id,
      assignedUsers: [
        { freelancer: flRahul._id, role: "CANDID", chargePerDay: 8000, days: 1, totalCharge: 8000 }
      ],
      status: "PENDING"
    });
    await job2.save();

    await Payment.create({
      party: cust2._id, event: event2._id, invoice: inv2._id,
      amount: 15000, type: "IN", mode: "UPI",
      description: "Advance for engagement", reference: "UPI-ENG-001"
    });

    console.log("✓ Order 2 (MID-FLOW) — Amit & Neha Engagement");

    // ══════════════════════════════════════════════════════════
    // ORDER 3: EARLY — Vikram Birthday (Quotation SENT, no invoice)
    // ══════════════════════════════════════════════════════════

    const quot3 = new Quotation({
      customer: cust3._id,
      items: [
        { service: svcCandid._id, days: 1, pricePerDay: 15000, total: 15000 }
      ],
      discount: 0,
      status: "SENT",
      notes: "Birthday party shoot",
      validUntil: new Date(Date.now() + 15 * 86400000)
    });
    await quot3.save();

    console.log("✓ Order 3 (EARLY) — Vikram Birthday Quotation");

    // ══════════════════════════════════════════════════════════
    console.log("\n══════════════════════════════════════════");
    console.log("  Data Imported Successfully!");
    console.log("══════════════════════════════════════════");
    console.log("\n  Login: admin@example.com / password123");
    console.log("\n  1. Raj & Priya Wedding    → Invoice PAID, Event COMPLETED");
    console.log("  2. Amit & Neha Engagement → Invoice PARTIAL, Event CONFIRMED");
    console.log("  3. Vikram Birthday        → Quotation SENT (no invoice yet)");
    console.log("══════════════════════════════════════════\n");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Promise.all([
      User.deleteMany(), Party.deleteMany(), Service.deleteMany(),
      Package.deleteMany(), Freelancer.deleteMany(), Quotation.deleteMany(),
      Invoice.deleteMany(), Event.deleteMany(), Job.deleteMany(), Payment.deleteMany()
    ]);
    console.log("Data Destroyed!");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
