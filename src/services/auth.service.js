import { BaseService } from "../core/classbase.service.js"
import User from "../schemas/user.schema.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

class AuthService extends BaseService {
  constructor() {
    super(User)
  }

  async register(data) {
    const existing = await User.findOne({ email: data.email })
    if (existing) {
      throw Object.assign(new Error("Email already registered"), { status: 409 })
    }

    const hashed = await bcrypt.hash(data.password, 10)

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashed,
      phone: data.phone,
      role: data.role || "STAFF"
    })

    return { id: user._id, name: user.name, email: user.email, role: user.role }
  }

  async login(email, password) {
    const user = await User.findOne({ email })
    if (!user) throw Object.assign(new Error("User not found"), { status: 404 })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw Object.assign(new Error("Invalid password"), { status: 401 })

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    return {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    }
  }

  async findAll(filter = {}) {
    return super.findAll(filter)
  }

  async findById(id) {
    return super.findById(id)
  }

  async beforeUpdate(data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }
    return data
  }

  async update(id, data) {
    return super.update(id, data)
  }

  async remove(id) {
    return super.remove(id)
  }
}

export const authService = new AuthService()