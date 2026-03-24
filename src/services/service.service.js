import Service from "../schemas/service.schema.js"
import { BaseService } from "../core/classbase.service.js"

class ServiceService extends BaseService {
  constructor() {
    super(Service)
  }

  async findAll(filter = {}) {
    return super.findAll(filter, { sort: { name: 1 } })
  }

  async findByType(type) {
    return this.model.find({ type, isActive: true }).lean()
  }
}

export const serviceService = new ServiceService()
