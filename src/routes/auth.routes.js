import { Router } from "express"
import { register, login, getUsers, getUserById, updateUser, deleteUser, getMe } from "../controllers/auth.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { authorizeRoles } from "../middlewares/role.middleware.js"

const router = Router()

router.post("/register", register)
router.post("/login", login)

// Protected routes
router.use(authMiddleware)
router.get("/me", getMe)
router.get("/users", authorizeRoles("ADMIN"), getUsers)
router.get("/users/:id", authorizeRoles("ADMIN"), getUserById)
router.put("/users/:id", authorizeRoles("ADMIN"), updateUser)
router.delete("/users/:id", authorizeRoles("ADMIN"), deleteUser)

export default router