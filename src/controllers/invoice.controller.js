import { invoiceService } from "../services/invoice.service.js"

export const getInvoices = async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.status) filter.status = req.query.status.toUpperCase()
    if (req.query.customer) filter.customer = req.query.customer
    const data = await invoiceService.findAll({ ...filter, ...req.query })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getInvoiceById = async (req, res, next) => {
  try {
    const data = await invoiceService.findById(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: "Invoice not found" })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const createInvoice = async (req, res, next) => {
  try {
    const data = await invoiceService.create(req.body)
    res.status(201).json({ success: true, data, message: "Invoice created" })
  } catch (err) {
    next(err)
  }
}

export const createFromQuotation = async (req, res, next) => {
  try {
    const data = await invoiceService.createFromQuotation(req.params.quotationId)
    res.status(201).json({ success: true, data, message: "Invoice created from quotation" })
  } catch (err) {
    next(err)
  }
}

export const updateInvoice = async (req, res, next) => {
  try {
    const data = await invoiceService.update(req.params.id, req.body)
    res.json({ success: true, data, message: "Invoice updated" })
  } catch (err) {
    next(err)
  }
}

export const deleteInvoice = async (req, res, next) => {
  try {
    await invoiceService.remove(req.params.id)
    res.json({ success: true, message: "Invoice deleted" })
  } catch (err) {
    next(err)
  }
}
