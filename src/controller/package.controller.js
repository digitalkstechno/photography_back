import { packageService } from "../services/package.service.js";

export const getPackages = async (req, res, next) => {
  try {
    const data = await packageService.findAll(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getPackageById = async (req, res, next) => {
  try {
    const data = await packageService.findById(Number(req.params.id));
    if (!data) return res.status(404).json({ message: "Package not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const createPackage = async (req, res, next) => {
  try {
    const payload = req.body;
    if (payload.price) payload.price = Number(payload.price);
    if (payload.days) payload.days = Number(payload.days);
    const data = await packageService.create(payload);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

export const updatePackage = async (req, res, next) => {
  try {
    const payload = req.body;
    if (payload.price) payload.price = Number(payload.price);
    if (payload.days) payload.days = Number(payload.days);
    const data = await packageService.update(Number(req.params.id), payload);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const deletePackage = async (req, res, next) => {
  try {
    await packageService.remove(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
