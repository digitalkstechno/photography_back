import { ledgerService } from "../services/ledger.service.js"

export const getPartyLedger = async (req, res, next) => {
  try {
    const data = await ledgerService.getPartyLedger(req.params.partyId)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getAllBalances = async (req, res, next) => {
  try {
    const data = await ledgerService.getAllBalances()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
