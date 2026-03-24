import Package from "../schemas/package.schema.js"
import { BaseService } from "../core/classbase.service.js"

class PackageService extends BaseService {
  constructor() {
    super(Package)
  }

  async findAll(filter = {}) {
    return super.findAll(filter, { sort: { name: 1 }, populate: "includedServices" })
  }

  async findById(id) {
    return this.model.findById(id).populate("includedServices").lean()
  }
}

export const packageService = new PackageService()
