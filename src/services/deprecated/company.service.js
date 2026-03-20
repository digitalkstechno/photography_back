// services/company.service.js

import prisma from "../config/prisma.js"
import { BaseService } from "../core/base.service.js"

class CompanyService extends BaseService {
  constructor() {
    super(prisma.company)
  }

  async afterCreate(company) {
    // 🔥 create default accounts
    await prisma.account.createMany({
      data: [
        { name: "Cash", type: "ASSET", companyId: company.id },
        { name: "Revenue", type: "INCOME", companyId: company.id },
        { name: "Expense", type: "EXPENSE", companyId: company.id }
      ]
    })
  }
}

export const companyService = new CompanyService()