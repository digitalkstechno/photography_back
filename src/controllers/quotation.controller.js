import { quotationService } from "../services/quotation.service.js"

export const getQuotations = async (req, res, next) => {
  try {
    const data = await quotationService.findAll(req.query)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getQuotationById = async (req, res, next) => {
  try {
    const data = await quotationService.findById(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: "Quotation not found" })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const createQuotation = async (req, res, next) => {
  try {
    const data = await quotationService.create(req.body)
    res.status(201).json({ success: true, data, message: "Quotation created" })
  } catch (err) {
    next(err)
  }
}

export const updateQuotation = async (req, res, next) => {
  try {
    const data = await quotationService.update(req.params.id, req.body)
    res.json({ success: true, data, message: "Quotation updated" })
  } catch (err) {
    next(err)
  }
}

export const deleteQuotation = async (req, res, next) => {
  try {
    await quotationService.remove(req.params.id)
    res.json({ success: true, message: "Quotation deleted" })
  } catch (err) {
    next(err)
  }
}

export const sendQuotation = async (req, res, next) => {
  try {
    const data = await quotationService.sendToCustomer(req.params.id)
    res.json({ success: true, data, message: "Quotation sent to customer" })
  } catch (err) {
    next(err)
  }
}