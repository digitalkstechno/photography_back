import { transactionService } from "../services/transaction.service.js"

export const getTransactions = async (req, res, next) => {
  try {
    const data = await transactionService.findAll()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const getSalesQuotations = async (req, res, next) => {
  try {
    const data = await transactionService.getSalesQuotations()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const getSalesInvoices = async (req, res, next) => {
  try {
    const data = await transactionService.getSalesInvoices()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const getPurchaseInvoices = async (req, res, next) => {
  try {
    const data = await transactionService.getPurchaseInvoices()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const getTransactionById = async (req, res, next) => {
  try {
    const data = await transactionService.findById(Number(req.params.id))
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const createTransaction = async (req, res, next) => {
  try {
    const data = await transactionService.create(req.body)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const createQuotation = async (req, res, next) => {
  try {
    const data = await transactionService.createSalesQuotation(req.body)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const createSalesInvoice = async (req, res, next) => {
  try {
    const data = await transactionService.createSalesInvoice(req.body)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const createPurchaseInvoice = async (req, res, next) => {
  try {
    const data = await transactionService.createPurchaseInvoice(req.body)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const convertQuotationToInvoice = async (req, res, next) => {
  try {
    const quotationId = Number(req.params.id)
    const data = await transactionService.convertQuotationToInvoice(quotationId)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const updateTransaction = async (req, res, next) => {
  try {
    const data = await transactionService.update(
      Number(req.params.id),
      req.body
    )
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const deleteTransaction = async (req, res, next) => {
  try {
    await transactionService.remove(Number(req.params.id))
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}