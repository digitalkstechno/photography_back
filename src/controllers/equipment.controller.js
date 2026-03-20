import { equipmentService } from "../services/equipment.service.js"

export const getEquipment = async (req, res, next) => {
  try {
    const filter = req.query.category ? { category: req.query.category.toUpperCase() } : {}
    const data = await equipmentService.findAll({ ...filter, ...req.query })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getEquipmentById = async (req, res, next) => {
  try {
    const data = await equipmentService.findById(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: "Equipment not found" })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const createEquipment = async (req, res, next) => {
  try {
    const data = await equipmentService.create(req.body)
    res.status(201).json({ success: true, data, message: "Equipment created" })
  } catch (err) {
    next(err)
  }
}

export const updateEquipment = async (req, res, next) => {
  try {
    const data = await equipmentService.update(req.params.id, req.body)
    res.json({ success: true, data, message: "Equipment updated" })
  } catch (err) {
    next(err)
  }
}

export const deleteEquipment = async (req, res, next) => {
  try {
    await equipmentService.remove(req.params.id)
    res.json({ success: true, message: "Equipment deleted" })
  } catch (err) {
    next(err)
  }
}
