import Service from "../schemas/service.schema.js"
import { BaseService } from "../core/classbase.service.js"

class ServiceService extends BaseService {
  constructor() {
    super(Service)
  }

  async findAll() {
    return this.model.find().sort({ name: 1 }).lean()
  }

  async findByType(type) {
    return this.model.find({ type, isActive: true }).lean()
  }
}

export const serviceService = new ServiceService()
