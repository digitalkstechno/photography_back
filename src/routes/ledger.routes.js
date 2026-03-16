import { Router } from "express";
import {
  getLedgerEntries,
  getLedgerEntryById,
  createLedgerEntry,
  updateLedgerEntry,
  deleteLedgerEntry
} from "../controller/ledger.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getLedgerEntries);
router.get("/:id", getLedgerEntryById);
router.post("/", createLedgerEntry);
router.put("/:id", updateLedgerEntry);
router.delete("/:id", deleteLedgerEntry);

export default router;
