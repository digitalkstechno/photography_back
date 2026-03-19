import { Router } from "express"
import {
  getParties, getPartyById, createParty, updateParty, deleteParty,
  getCustomers, getVendors, getPartyLedger, searchParties
} from "../controllers/party.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(authMiddleware)

router.get("/", getParties)
router.get("/search", searchParties)
router.get("/customers", getCustomers)
router.get("/vendors", getVendors)
router.get("/:id", getPartyById)
router.get("/:id/ledger", getPartyLedger)
router.post("/", createParty)
router.put("/:id", updateParty)
router.delete("/:id", deleteParty)

export default router