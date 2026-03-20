import { paymentService } from "../services/payment.service.js"

export const getPayments = async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.type) filter.type = req.query.type.toUpperCase()
    if (req.query.party) filter.party = req.query.party
    if (req.query.mode) filter.mode = req.query.mode.toUpperCase()
    const data = await paymentService.findAll({ ...filter, ...req.query })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getPaymentById = async (req, res, next) => {
  try {
    const data = await paymentService.findById(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: "Payment not found" })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getPaymentsByParty = async (req, res, next) => {
  try {
    const data = await paymentService.findByParty(req.params.partyId)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const createPayment = async (req, res, next) => {
  try {
    const data = await paymentService.create(req.body)
    res.status(201).json({ success: true, data, message: "Payment recorded" })
  } catch (err) {
    next(err)
  }
}

export const updatePayment = async (req, res, next) => {
  try {
    const data = await paymentService.update(req.params.id, req.body)
    res.json({ success: true, data, message: "Payment updated" })
  } catch (err) {
    next(err)
  }
}

export const deletePayment = async (req, res, next) => {
  try {
    await paymentService.remove(req.params.id)
    res.json({ success: true, message: "Payment deleted" })
  } catch (err) {
    next(err)
  }
}

export const getPaymentSummary = async (req, res, next) => {
  try {
    const data = await paymentService.getSummary()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}