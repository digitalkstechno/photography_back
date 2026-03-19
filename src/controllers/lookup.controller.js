import { lookupService } from "../services/lookup.service.js"

// ── Party Types ──
export const getPartyTypes = async (req, res, next) => {
  try { res.json(await lookupService.getPartyTypes()) } catch (err) { next(err) }
}

// ── Units ──
export const getUnits = async (req, res, next) => {
  try { res.json(await lookupService.getUnits()) } catch (err) { next(err) }
}
export const createUnit = async (req, res, next) => {
  try { res.status(201).json(await lookupService.createUnit(req.body)) } catch (err) { next(err) }
}
export const updateUnit = async (req, res, next) => {
  try { res.json(await lookupService.updateUnit(Number(req.params.id), req.body)) } catch (err) { next(err) }
}
export const deleteUnit = async (req, res, next) => {
  try { await lookupService.deleteUnit(Number(req.params.id)); res.json({ success: true }) } catch (err) { next(err) }
}

// ── Item Categories ──
export const getCategories = async (req, res, next) => {
  try { res.json(await lookupService.getCategories()) } catch (err) { next(err) }
}
export const createCategory = async (req, res, next) => {
  try { res.status(201).json(await lookupService.createCategory(req.body)) } catch (err) { next(err) }
}
export const updateCategory = async (req, res, next) => {
  try { res.json(await lookupService.updateCategory(Number(req.params.id), req.body)) } catch (err) { next(err) }
}
export const deleteCategory = async (req, res, next) => {
  try { await lookupService.deleteCategory(Number(req.params.id)); res.json({ success: true }) } catch (err) { next(err) }
}

// ── Tags ──
export const getTags = async (req, res, next) => {
  try { res.json(await lookupService.getTags()) } catch (err) { next(err) }
}
export const createTag = async (req, res, next) => {
  try { res.status(201).json(await lookupService.createTag(req.body)) } catch (err) { next(err) }
}
export const updateTag = async (req, res, next) => {
  try { res.json(await lookupService.updateTag(Number(req.params.id), req.body)) } catch (err) { next(err) }
}
export const deleteTag = async (req, res, next) => {
  try { await lookupService.deleteTag(Number(req.params.id)); res.json({ success: true }) } catch (err) { next(err) }
}

// ── Payment Methods ──
export const getPaymentMethods = async (req, res, next) => {
  try { res.json(await lookupService.getPaymentMethods()) } catch (err) { next(err) }
}

// ── Transaction Types ──
export const getTransactionTypes = async (req, res, next) => {
  try { res.json(await lookupService.getTransactionTypes()) } catch (err) { next(err) }
}

// ── Transaction Statuses ──
export const getTransactionStatuses = async (req, res, next) => {
  try { res.json(await lookupService.getTransactionStatuses()) } catch (err) { next(err) }
}
