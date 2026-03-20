import { jobService } from "../services/job.service.js"

export const getJobs = async (req, res, next) => {
  try {
    const data = await jobService.findAll(req.query)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getJobById = async (req, res, next) => {
  try {
    const data = await jobService.findById(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: "Job not found" })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getJobsByEvent = async (req, res, next) => {
  try {
    const data = await jobService.findByEvent(req.params.eventId)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const createJob = async (req, res, next) => {
  try {
    const data = await jobService.createFromEvent(req.body.event, req.body)
    res.status(201).json({ success: true, data, message: "Job created" })
  } catch (err) {
    next(err)
  }
}

export const updateJob = async (req, res, next) => {
  try {
    const data = await jobService.update(req.params.id, req.body)
    res.json({ success: true, data, message: "Job updated" })
  } catch (err) {
    next(err)
  }
}

export const deleteJob = async (req, res, next) => {
  try {
    await jobService.remove(req.params.id)
    res.json({ success: true, message: "Job deleted" })
  } catch (err) {
    next(err)
  }
}
