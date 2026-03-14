import prisma from "../src/config/prisma.js"

async function main() {
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

  for (const name of ["SALE_QUOTATION", "SALE_INVOICE", "PURCHASE_INVOICE"]) {
    await prisma.transactionType.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }

  for (const name of ["UNPAID", "PARTIAL", "PAID"]) {
    await prisma.transactionStatus.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }

  for (const name of ["Cash", "Bank", "UPI", "Card"]) {
    await prisma.paymentMethod.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }

  // Minimal units to support items/services
  for (const name of [
    { name: "Unit", shortName: "u" },
    { name: "Hour", shortName: "hr" },
    { name: "Day", shortName: "day" }
  ]) {
    await prisma.unit.upsert({
      where: { name: name.name },
      update: {},
      create: name
    })
  }
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

