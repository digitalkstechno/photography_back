// services/account.service.js

import prisma from "../config/prisma.js"
import { BaseService } from "../core/classbase.service.js"

class AccountService extends BaseService {
  constructor() {
    super(prisma.account)
  }

  async getOrCreatePartyAccount(partyId, companyId) {
    let acc = await this.model.findFirst({
      where: { partyId, companyId }
    })

    if (!acc) {
      acc = await this.model.create({
        data: {
          name: `Party-${partyId}`,
          type: "ASSET",
          partyId,
          companyId
        }
      })
    }

    return acc
  }

  async getSystemAccount(name, companyId) {
    return this.model.findFirst({
      where: { name, companyId }
    })
  }
}

export const accountService = new AccountService();