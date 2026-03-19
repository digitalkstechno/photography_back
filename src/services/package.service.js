import Package from "../schemas/package.schema.js"
import { BaseService } from "../core/classbase.service.js"

class PackageService extends BaseService {
  constructor() {
    super(Package)
  }

  async findAll() {
    return this.model.find().populate("includedServices").sort({ name: 1 }).lean()
  }

  async findById(id) {
    return this.model.findById(id).populate("includedServices").lean()
  }
}

export const packageService = new PackageService()
