import { serviceService } from "../services/service.service.js"

export const getServices = async (req, res, next) => {
  try {
    const data = await serviceService.findAll(req.query)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getServiceById = async (req, res, next) => {
  try {
    const data = await serviceService.findById(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: "Service not found" })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getServicesByType = async (req, res, next) => {
  try {
    const data = await serviceService.findByType(req.params.type.toUpperCase())
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const createService = async (req, res, next) => {
  try {
    const data = await serviceService.create(req.body)
    res.status(201).json({ success: true, data, message: "Service created" })
  } catch (err) {
    next(err)
  }
}

export const updateService = async (req, res, next) => {
  try {
    const data = await serviceService.update(req.params.id, req.body)
    res.json({ success: true, data, message: "Service updated" })
  } catch (err) {
    next(err)
  }
}

export const deleteService = async (req, res, next) => {
  try {
    await serviceService.remove(req.params.id)
    res.json({ success: true, message: "Service deleted" })
  } catch (err) {
    next(err)
  }
}
