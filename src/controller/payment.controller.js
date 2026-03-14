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
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const createPayment = async (req, res, next) => {
  try {
    const data = await paymentService.createAndUpdateTransactionStatus(req.body)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const deletePayment = async (req, res, next) => {
  try {
    await paymentService.remove(Number(req.params.id))
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}