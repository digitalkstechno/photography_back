import { packageService } from "../services/package.service.js"

export const getPackages = async (req, res, next) => {
  try {
    const data = await packageService.findAll()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getPackageById = async (req, res, next) => {
  try {
    const data = await packageService.findById(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: "Package not found" })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const createPackage = async (req, res, next) => {
  try {
    const data = await packageService.create(req.body)
    res.status(201).json({ success: true, data, message: "Package created" })
  } catch (err) {
    next(err)
  }
}

export const updatePackage = async (req, res, next) => {
  try {
    const data = await packageService.update(req.params.id, req.body)
    res.json({ success: true, data, message: "Package updated" })
  } catch (err) {
    next(err)
  }
}

export const deletePackage = async (req, res, next) => {
  try {
    await packageService.remove(req.params.id)
    res.json({ success: true, message: "Package deleted" })
  } catch (err) {
    next(err)
  }
}
