import { freelancerService } from "../services/freelancer.service.js"

export const getFreelancers = async (req, res, next) => {
  try {
    const data = req.query.skill
      ? await freelancerService.findBySkill(req.query.skill.toUpperCase())
      : await freelancerService.findAll()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getFreelancerById = async (req, res, next) => {
  try {
    const data = await freelancerService.findById(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: "Freelancer not found" })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const createFreelancer = async (req, res, next) => {
  try {
    const data = await freelancerService.create(req.body)
    res.status(201).json({ success: true, data, message: "Freelancer created" })
  } catch (err) {
    next(err)
  }
}

export const updateFreelancer = async (req, res, next) => {
  try {
    const data = await freelancerService.update(req.params.id, req.body)
    res.json({ success: true, data, message: "Freelancer updated" })
  } catch (err) {
    next(err)
  }
}

export const deleteFreelancer = async (req, res, next) => {
  try {
    await freelancerService.remove(req.params.id)
    res.json({ success: true, message: "Freelancer deleted" })
  } catch (err) {
    next(err)
  }
}
