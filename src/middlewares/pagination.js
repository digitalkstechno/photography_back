export const pagination = (req, res, next) => {

  const page = Math.max(parseInt(req.query.page) || 1, 1)
  const limit = Math.min(parseInt(req.query.limit) || 20, 100)

  const skip = (page - 1) * limit

  req.pagination = {
    page,
    limit,
    skip
  }

  next()
}