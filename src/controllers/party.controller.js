import { partyService } from "../services/party.service.js"

export const getParties = async (req, res, next) => {
  try {
    const data = await partyService.findAll(req.query)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getCustomers = async (req, res, next) => {
  try {
    const data = await partyService.getCustomers()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getVendors = async (req, res, next) => {
  try {
    const data = await partyService.getVendors()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const searchParties = async (req, res, next) => {
  try {
    const q = req.query.q || ""
    const data = await partyService.searchParties(q)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getPartyById = async (req, res, next) => {
  try {
    const data = await partyService.findById(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: "Party not found" })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getPartyLedger = async (req, res, next) => {
  try {
    const data = await partyService.getPartyLedger(req.params.id)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const createParty = async (req, res, next) => {
  try {
    const data = await partyService.create(req.body)
    res.status(201).json({ success: true, data, message: "Party created" })
  } catch (err) {
    next(err)
  }
}

export const updateParty = async (req, res, next) => {
  try {
    const data = await partyService.update(req.params.id, req.body)
    res.json({ success: true, data, message: "Party updated" })
  } catch (err) {
    next(err)
  }
}

export const deleteParty = async (req, res, next) => {
  try {
    await partyService.remove(req.params.id)
    res.json({ success: true, message: "Party deleted" })
  } catch (err) {
    next(err)
  }
}