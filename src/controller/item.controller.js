import { itemService } from "../services/item.service.js"

export const getItems = async (req, res, next) => {
  try {
    const data = await itemService.findAll()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const getItemById = async (req, res, next) => {
  try {
    const data = await itemService.findById(Number(req.params.id))
    if (!data) return res.status(404).json({ message: "Item not found" })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const searchItems = async (req, res, next) => {
  try {
    const q = req.query.q || ""
    const data = await itemService.searchItems(q)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const getItemsByCategory = async (req, res, next) => {
  try {
    const data = await itemService.getItemsByCategory(Number(req.params.categoryId))
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const createItem = async (req, res, next) => {
  try {

    const payload = req.body;

    // type conversions
    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.unitId !== undefined) payload.unitId = Number(payload.unitId);
    if (payload.categoryId !== undefined)
      payload.categoryId = payload.categoryId ? Number(payload.categoryId) : null;

    const data = await itemService.create(payload);

    res.status(201).json(data);

  } catch (err) {
    next(err);
  }
};


export const updateItem = async (req, res, next) => {
  try {
    const data = await itemService.update(
      Number(req.params.id),
      req.body
    )
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const deleteItem = async (req, res, next) => {
  try {
    await itemService.remove(Number(req.params.id))
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}