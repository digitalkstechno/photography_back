import { partyService } from "../services/party.service.js"

export const getParties = async (req, res, next) => {
  try {
    const data = await partyService.findAll()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const getCustomers = async (req, res, next) => {
  try {
    const data = await partyService.getCustomers()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const getVendors = async (req, res, next) => {
  try {
    const data = await partyService.getVendors()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const searchParties = async (req, res, next) => {
  try {
    const q = req.query.q || ""
    const data = await partyService.searchParties(q)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const getPartyById = async (req, res, next) => {
  try {
    const data = await partyService.findById(Number(req.params.id))
    if (!data) return res.status(404).json({ message: "Party not found" })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const getPartyLedger = async (req, res, next) => {
  try {
    const partyId = Number(req.params.id)
    const data = await partyService.getPartyLedger(partyId)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const createParty = async (req, res, next) => {
  try {
    const data = await partyService.create(req.body)
    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
}

export const updateParty = async (req, res, next) => {
  try {
    const data = await partyService.update(
      Number(req.params.id),
      req.body
    )
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const deleteParty = async (req, res, next) => {
  try {
    await partyService.remove(Number(req.params.id))
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}