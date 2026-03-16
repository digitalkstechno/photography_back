import { Router } from "express"
import { register, login, getUsers } from "../controller/auth.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/users", authMiddleware, getUsers)

export default router