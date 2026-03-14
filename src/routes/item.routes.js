import { Router } from "express"

import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} from "../controller/item.controller.js"

import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

// protect all routes
router.use(authMiddleware)

router.get("/", getItems)
router.get("/:id", getItemById)
router.post("/", createItem)
router.put("/:id", updateItem)
router.delete("/:id", deleteItem)

export default router