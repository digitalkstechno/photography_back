import { paymentService } from "../services/payment.service.js"

export const getPayments = async (req, res, next) => {
  try {
    const data = await paymentService.findAll()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const getPaymentById = async (req, res, next) => {
  try {
    const data = await paymentService.findById(Number(req.params.id))
    if (!data) return res.status(404).json({ message: "Payment not found" })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const getPaymentsByTransaction = async (req, res, next) => {
  try {
    const data = await paymentService.getPaymentsByTransaction(
      Number(req.params.transactionId)
    )
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const createPayment = async (req, res, next) => {
  try {
    const data = await paymentService.createAndUpdateTransactionStatus(req.body)
    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
}

export const deletePayment = async (req, res, next) => {
  try {
    const data = await paymentService.deleteAndRecalculate(Number(req.params.id))
    res.json(data)
  } catch (err) {
    next(err)
  }
}