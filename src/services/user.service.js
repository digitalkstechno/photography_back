import { BaseService } from "../core/classbase.service.js"
import User from "../schemas/user.schema.js"
import bcrypt from "bcryptjs"

class UserService extends BaseService {
  constructor() {
    super(User)
  }
  async findAll(filter = {}) {
    return super.findAll(filter, { sort: { createdAt: -1 } })
  }
  async beforeCreate(data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    } else {
      data.password = await bcrypt.hash("staff123", 10)
    }
    return data
  }
}

export const userService = new UserService()
