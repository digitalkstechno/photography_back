import { getApiKey } from "../config/company.js"

export const validateApiKey = async (req, res, next) => {
  const key = req.headers["x-api-key"]

  const validKey = await getApiKey()

  if (!key || key !== validKey) {
    return res.status(401).json({ message: "Invalid API Key" })
  }

  next()
}