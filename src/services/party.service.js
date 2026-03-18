// services/party.service.js

import prisma from "../config/prisma.js"
import { BaseService } from "../core/classbase.service.js"

class PartyService extends BaseService {
  constructor() {
    super(prisma.party)
  }

  async afterCreate(party) {
    await prisma.account.create({
      data: {
        name: party.name,
        type: "ASSET",
        partyId: party.id,
        companyId: party.companyId
      }
    })
  }

  // custom query
  async findAll() {
    return this.model.findMany({
      include: {
        tags: { include: { tag: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  }

  async getCustomers() {
    return this.model.findMany({
      where: { partyType: "CUSTOMER" }
    })
  }

  async getVendors() {
    return this.model.findMany({
      where: { partyType: "VENDOR" }
    })
  }
}

export const partyService = new PartyService()