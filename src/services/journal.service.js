// services/journal.service.js

import prisma from "../config/prisma.js"

class JournalService {
  async createEntry({ companyId, description, entries }) {
    // 🔥 validation
    const totalDebit = entries.reduce((a, e) => a + Number(e.debit), 0)
    const totalCredit = entries.reduce((a, e) => a + Number(e.credit), 0)

    if (totalDebit !== totalCredit) {
      throw new Error("Debit and Credit must be equal")
    }

    return prisma.journalEntry.create({
      data: {
        companyId,
        date: new Date(),
        description,
        entries: {
          create: entries
        }
      }
    })
  }
}

export const journalService = new JournalService()  