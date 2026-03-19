import { userService } from "../services/user.service.js";

export const getUsers = async (req, res, next) => {
  try {
    const data = await userService.findAll(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const data = await userService.findById(Number(req.params.id));
    if (!data) return res.status(404).json({ message: "User not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const payload = req.body;
    if (payload.charges) payload.charges = Number(payload.charges);
    const data = await userService.create(payload);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const payload = req.body;
    if (payload.charges) payload.charges = Number(payload.charges);
    const data = await userService.update(Number(req.params.id), payload);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await userService.remove(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
