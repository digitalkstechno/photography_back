import User from "../schemas/user.schema.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const authService = {

  register: async (data) => {
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
  },

  login: async (email, password) => {
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
  },

  findAll: async () => {
    return User.find().select("-password").lean()
  },

  findById: async (id) => {
    return User.findById(id).select("-password").lean()
  },

  update: async (id, data) => {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select("-password").lean()
  },

  remove: async (id) => {
    return User.findByIdAndDelete(id).lean()
  }
}