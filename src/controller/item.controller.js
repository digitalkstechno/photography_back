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
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const createItem = async (req, res, next) => {
  try {
    const data = await itemService.create(req.body)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

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