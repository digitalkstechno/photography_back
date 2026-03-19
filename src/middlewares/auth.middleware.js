import jwt from "jsonwebtoken"
import User from "../schemas/user.schema.js"

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: no token provided" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password").lean()

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized: user not found" })
    }

    req.user = user
    next()
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" })
  }
}