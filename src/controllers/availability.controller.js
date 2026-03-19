import { availabilityService } from "../services/availability.service.js";

export const getAvailabilities = async (req, res, next) => {
  try {
    const data = await availabilityService.findAll(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getAvailabilityById = async (req, res, next) => {
  try {
    const data = await availabilityService.findById(Number(req.params.id));
    if (!data) return res.status(404).json({ message: "Availability not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const createAvailability = async (req, res, next) => {
  try {
    const payload = req.body;
    if (payload.userId) payload.userId = Number(payload.userId);
    if (payload.date) payload.date = new Date(payload.date);
    const data = await availabilityService.create(payload);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

export const updateAvailability = async (req, res, next) => {
  try {
    const payload = req.body;
    if (payload.userId) payload.userId = Number(payload.userId);
    if (payload.date) payload.date = new Date(payload.date);
    const data = await availabilityService.update(Number(req.params.id), payload);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const deleteAvailability = async (req, res, next) => {
  try {
    await availabilityService.remove(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
