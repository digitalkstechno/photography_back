import prisma from "../config/prisma.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const authService = {

  register: async (data) => {

    const hashed = await bcrypt.hash(data.password, 10)

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed
      }
    })
  },

  login: async (email, password) => {

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) throw new Error("User not found")

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) throw new Error("Invalid password")

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    return { user, token }
  }

}