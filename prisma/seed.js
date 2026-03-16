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

  // ── Sample Parties (Customer & Vendor) ──
  const customerType = await prisma.partyType.findUnique({ where: { name: "Customer" } })
  const vendorType = await prisma.partyType.findUnique({ where: { name: "Vendor" } })

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

  // ── Sample Transactions ──
  const saleQuotationType = await prisma.transactionType.findUnique({ where: { name: "SALE_QUOTATION" } })
  const saleInvoiceType = await prisma.transactionType.findUnique({ where: { name: "SALE_INVOICE" } })
  
  const unpaidStatus = await prisma.transactionStatus.findUnique({ where: { name: "UNPAID" } })
  const paidStatus = await prisma.transactionStatus.findUnique({ where: { name: "PAID" } })

  const cashMethod = await prisma.paymentMethod.findUnique({ where: { name: "Cash" } })

  const weddingShoot = await prisma.item.findFirst({ where: { name: "Wedding Shoot" } })
  const droneShoot = await prisma.item.findFirst({ where: { name: "Drone Shoot" } })

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
