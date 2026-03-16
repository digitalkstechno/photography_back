import prisma from "../src/config/prisma.js"
import bcrypt from "bcryptjs"

async function main() {
  // ── Party Types ──
  await prisma.partyType.upsert({
    where: { name: "Customer" },
    update: {},
    create: { name: "Customer" }
  })
  await prisma.partyType.upsert({
    where: { name: "Vendor" },
    update: {},
    create: { name: "Vendor" }
  })

  // ── Transaction Types ──
  for (const name of ["SALE_QUOTATION", "SALE_INVOICE", "PURCHASE_INVOICE"]) {
    await prisma.transactionType.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }

  // ── Transaction Statuses ──
  for (const name of ["UNPAID", "PARTIAL", "PAID"]) {
    await prisma.transactionStatus.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }

  // ── Payment Methods ──
  for (const name of ["Cash", "Bank", "UPI", "Card"]) {
    await prisma.paymentMethod.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }

  // ── Units ──
  for (const unit of [
    { name: "Unit", shortName: "u" },
    { name: "Hour", shortName: "hr" },
    { name: "Day", shortName: "day" },
    { name: "Page", shortName: "pg" },
    { name: "Set", shortName: "set" }
  ]) {
    await prisma.unit.upsert({
      where: { name: unit.name },
      update: {},
      create: unit
    })
  }

  // ── Item Categories ──
  for (const name of ["Photography", "Videography", "Printing", "Editing", "Equipment Rental"]) {
    await prisma.itemCategory.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }

  // ── Tags ──
  for (const name of ["VIP", "Regular", "Corporate", "Wedding", "Event"]) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }

  // ── Sample Items ──
  const photographyCategory = await prisma.itemCategory.findUnique({ where: { name: "Photography" } })
  const videographyCategory = await prisma.itemCategory.findUnique({ where: { name: "Videography" } })
  const printingCategory = await prisma.itemCategory.findUnique({ where: { name: "Printing" } })
  const editingCategory = await prisma.itemCategory.findUnique({ where: { name: "Editing" } })
  const rentalCategory = await prisma.itemCategory.findUnique({ where: { name: "Equipment Rental" } })

  const dayUnit = await prisma.unit.findUnique({ where: { name: "Day" } })
  const hourUnit = await prisma.unit.findUnique({ where: { name: "Hour" } })
  const unitUnit = await prisma.unit.findUnique({ where: { name: "Unit" } })
  const pageUnit = await prisma.unit.findUnique({ where: { name: "Page" } })
  const setUnit = await prisma.unit.findUnique({ where: { name: "Set" } })

  const sampleItems = [
    { name: "Wedding Shoot", price: 25000, unitId: dayUnit.id, categoryId: photographyCategory.id },
    { name: "Pre-Wedding Shoot", price: 15000, unitId: dayUnit.id, categoryId: photographyCategory.id },
    { name: "Birthday Shoot", price: 8000, unitId: dayUnit.id, categoryId: photographyCategory.id },
    { name: "Portfolio Shoot", price: 10000, unitId: hourUnit.id, categoryId: photographyCategory.id },
    { name: "Drone Shoot", price: 12000, unitId: hourUnit.id, categoryId: videographyCategory.id },
    { name: "Wedding Videography", price: 30000, unitId: dayUnit.id, categoryId: videographyCategory.id },
    { name: "Event Videography", price: 20000, unitId: dayUnit.id, categoryId: videographyCategory.id },
    { name: "Album Printing", price: 5000, unitId: unitUnit.id, categoryId: printingCategory.id },
    { name: "Canvas Print", price: 3000, unitId: unitUnit.id, categoryId: printingCategory.id },
    { name: "Photo Frame Set", price: 2500, unitId: setUnit.id, categoryId: printingCategory.id },
    { name: "Photo Editing", price: 500, unitId: pageUnit.id, categoryId: editingCategory.id },
    { name: "Video Editing", price: 8000, unitId: hourUnit.id, categoryId: editingCategory.id },
    { name: "Drone Rental", price: 5000, unitId: dayUnit.id, categoryId: rentalCategory.id },
    { name: "Lighting Kit Rental", price: 2000, unitId: dayUnit.id, categoryId: rentalCategory.id }
  ]

  for (const item of sampleItems) {
    const existing = await prisma.item.findFirst({ where: { name: item.name } })
    if (!existing) {
      await prisma.item.create({ data: item })
    }
  }


  // ── Admin User ──
  const adminHashedPassword = await bcrypt.hash("admin123", 10)
  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@gmail.com",
      password: adminHashedPassword,
      role: "admin"
    }
  })

  // ── Team & Freelancers ──
  const staffHashedPassword = await bcrypt.hash("staff123", 10)
  const users = [
    { name: "Manager User", email: "manager@gmail.com", password: staffHashedPassword, role: "manager", phone: "1234567890", isFreelance: false },
    { name: "Staff User", email: "staff@gmail.com", password: staffHashedPassword, role: "staff", phone: "1234567891", isFreelance: false },
    { name: "John Freelancer", email: "john@freelance.com", password: staffHashedPassword, role: "freelancer", phone: "1234567892", skillset: "Candid Photography, Drone", isFreelance: true, charges: 5000 },
    { name: "Mary Freelancer", email: "mary@freelance.com", password: staffHashedPassword, role: "freelancer", phone: "1234567893", skillset: "Cinematography, Editing", isFreelance: true, charges: 6000 }
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    })
  }

  // ── Equipment ──
  const admin = await prisma.user.findUnique({ where: { email: "admin@gmail.com" } })
  const equipment = [
    { name: "Sony A7R IV", type: "Camera", serialNo: "SN12345", dailyRate: 2000, ownerId: admin.id, status: "AVAILABLE" },
    { name: "DJI Mavic 3", type: "Drone", serialNo: "SN67890", dailyRate: 3500, ownerId: admin.id, status: "AVAILABLE" },
    { name: "Godox AD600 Pro", type: "Light", serialNo: "SN11223", dailyRate: 500, ownerId: admin.id, status: "AVAILABLE" }
  ]

  for (const item of equipment) {
    const existing = await prisma.equipment.findFirst({ where: { serialNo: item.serialNo } })
    if (!existing) {
      await prisma.equipment.create({ data: item })
    }
  }

  // ── Packages ──
  const weddingShootItem = await prisma.item.findFirst({ where: { name: "Wedding Shoot" } })
  const weddingVideoItem = await prisma.item.findFirst({ where: { name: "Wedding Videography" } })
  const droneShootItem = await prisma.item.findFirst({ where: { name: "Drone Shoot" } })
  const albumPrintItem = await prisma.item.findFirst({ where: { name: "Album Printing" } })

  const packageData = [
    {
      name: "Basic Wedding Package",
      description: "Photography + Videography for 1 day",
      price: 50000,
      days: 1,
      items: {
        create: [
          { itemId: weddingShootItem.id, quantity: 1 },
          { itemId: weddingVideoItem.id, quantity: 1 }
        ]
      }
    },
    {
      name: "Premium Wedding Package",
      description: "Photography + Videography + Drone + Album for 2 days",
      price: 120000,
      days: 2,
      items: {
        create: [
          { itemId: weddingShootItem.id, quantity: 2 },
          { itemId: weddingVideoItem.id, quantity: 2 },
          { itemId: droneShootItem.id, quantity: 2 },
          { itemId: albumPrintItem.id, quantity: 1 }
        ]
      }
    }
  ]

  for (const pkg of packageData) {
    const existing = await prisma.package.findFirst({ where: { name: pkg.name } })
    if (!existing) {
      await prisma.package.create({ data: pkg })
    }
  }

  // ── Availability (Holidays) ──
  const holiDate = new Date("2026-03-25")
  const existingHoli = await prisma.availability.findFirst({ where: { date: holiDate, userId: null } })
  if (!existingHoli) {
    await prisma.availability.create({
      data: {
        date: holiDate,
        userId: null,
        isBlocked: true,
        reason: "Public Holiday - Holi"
      }
    })
  }

  // ── Sample Transactions (Existing logic continued) ──
  const saleQuotationType = await prisma.transactionType.findUnique({ where: { name: "SALE_QUOTATION" } })
  const saleInvoiceType = await prisma.transactionType.findUnique({ where: { name: "SALE_INVOICE" } })
  
  const unpaidStatus = await prisma.transactionStatus.findUnique({ where: { name: "UNPAID" } })
  const paidStatus = await prisma.transactionStatus.findUnique({ where: { name: "PAID" } })

  const cashMethod = await prisma.paymentMethod.findUnique({ where: { name: "Cash" } })

  const weddingShoot = await prisma.item.findFirst({ where: { name: "Wedding Shoot" } })
  const droneShoot = await prisma.item.findFirst({ where: { name: "Drone Shoot" } })

  const customerType = await prisma.partyType.findUnique({ where: { name: "Customer" } })
  let sampleCustomer = await prisma.party.findFirst({ where: { name: "John Doe (Customer)" } })
  if (!sampleCustomer) {
    sampleCustomer = await prisma.party.create({
      data: {
        name: "John Doe (Customer)",
        phone: "9876543210",
        address: "123 Main St, City",
        partyTypeId: customerType.id
      }
    })
  }

  const existingQuotation = await prisma.transaction.findFirst({
    where: { partyId: sampleCustomer.id, transactionTypeId: saleQuotationType.id }
  })
  if (!existingQuotation) {
    const qTotal = weddingShoot.price + droneShoot.price
    const q = await prisma.transaction.create({
      data: {
        partyId: sampleCustomer.id,
        transactionTypeId: saleQuotationType.id,
        statusId: unpaidStatus.id,
        total: qTotal,
        notes: "Sample Quotation",
        items: {
          create: [
            { itemId: weddingShoot.id, quantity: 1, price: weddingShoot.price, total: weddingShoot.price },
            { itemId: droneShoot.id, quantity: 1, price: droneShoot.price, total: droneShoot.price }
          ]
        }
      }
    })

    const iTotal = weddingShoot.price
    await prisma.transaction.create({
      data: {
        partyId: sampleCustomer.id,
        transactionTypeId: saleInvoiceType.id,
        statusId: paidStatus.id,
        total: iTotal,
        notes: "Sample Paid Invoice",
        referenceId: q.id,
        items: {
          create: [
            { itemId: weddingShoot.id, quantity: 1, price: weddingShoot.price, total: weddingShoot.price }
          ]
        },
        payments: {
          create: [
            { paymentMethodId: cashMethod.id, amount: iTotal, reference: "CASH001" }
          ]
        }
      }
    })
  }

  // ── Standalone Ledger Entries (No Invoice Required) ──
  const upiMethod = await prisma.paymentMethod.findUnique({ where: { name: "UPI" } })
  const bankMethod = await prisma.paymentMethod.findUnique({ where: { name: "Bank" } })

  // 1. Direct Payment from Client (CREDIT/IN)
  const existingLedger1 = await prisma.ledgerEntry.findFirst({ where: { description: "Advance for Engagement Shoot" } })
  if (!existingLedger1) {
    await prisma.ledgerEntry.create({
      data: {
        partyId: sampleCustomer.id,
        amount: 5000,
        type: "CREDIT",
        category: "Advance",
        description: "Advance for Engagement Shoot",
        paymentMethodId: upiMethod.id,
        date: new Date()
      }
    })
  }

  // 2. Direct Expense to Vendor (DEBIT/OUT)
  const vendorType = await prisma.partyType.findUnique({ where: { name: "Vendor" } })
  let sampleVendor = await prisma.party.findFirst({ where: { name: "Tech Store (Vendor)" } })
  if (!sampleVendor) {
    sampleVendor = await prisma.party.create({
      data: {
        name: "Tech Store (Vendor)",
        phone: "9988776655",
        address: "456 Market St, City",
        partyTypeId: vendorType.id
      }
    })
  }

  const existingLedger2 = await prisma.ledgerEntry.findFirst({ where: { description: "Rent for additional flash unit" } })
  if (!existingLedger2) {
    await prisma.ledgerEntry.create({
      data: {
        partyId: sampleVendor.id,
        amount: 800,
        type: "DEBIT",
        category: "Rental Expense",
        description: "Rent for additional flash unit",
        paymentMethodId: cashMethod.id,
        date: new Date()
      }
    })
  }

  console.log("Seed completed successfully!")

}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
