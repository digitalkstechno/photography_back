import Freelancer from "../schemas/freelancer.schema.js"
import { BaseService } from "../core/classbase.service.js"

class FreelancerService extends BaseService {
  constructor() {
    super(Freelancer)
  }

  async findAll(filter = {}) {
    return super.findAll(filter, { sort: { name: 1 } })
  }

  async findBySkill(skill) {
    return this.model.find({ skill, isActive: true }).lean()
  }

  async findActive() {
    return this.model.find({ isActive: true }).sort({ name: 1 }).lean()
  }
}

export const freelancerService = new FreelancerService()
