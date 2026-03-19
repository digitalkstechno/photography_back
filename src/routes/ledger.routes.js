import { Router } from "express"
import { getPartyLedger, getAllBalances } from "../controllers/ledger.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(authMiddleware)

router.get("/", getAllBalances)
router.get("/party/:partyId", getPartyLedger)

export default router
