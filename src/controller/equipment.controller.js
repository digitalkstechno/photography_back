import { equipmentService } from "../services/equipment.service.js";

export const getEquipment = async (req, res, next) => {
  try {
    const data = await equipmentService.findAll(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getEquipmentById = async (req, res, next) => {
  try {
    const data = await equipmentService.findById(Number(req.params.id));
    if (!data) return res.status(404).json({ message: "Equipment not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const createEquipment = async (req, res, next) => {
  try {
    const payload = req.body;
    if (payload.dailyRate) payload.dailyRate = Number(payload.dailyRate);
    if (payload.ownerId) payload.ownerId = Number(payload.ownerId);
    const data = await equipmentService.create(payload);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

export const updateEquipment = async (req, res, next) => {
  try {
    const payload = req.body;
    if (payload.dailyRate) payload.dailyRate = Number(payload.dailyRate);
    if (payload.ownerId) payload.ownerId = Number(payload.ownerId);
    const data = await equipmentService.update(Number(req.params.id), payload);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const deleteEquipment = async (req, res, next) => {
  try {
    await equipmentService.remove(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
