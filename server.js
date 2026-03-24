import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import connectDB from "./src/config/db.js"
import routes from "./src/routes/index.js"
import { errorHandler } from "./src/middlewares/errorHandler.js"
console.log("MONGO_URI:", process.env.MONGO_URI)
dotenv.config()
const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// API routes
app.use("/api", routes)

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "Photography Business API running", version: "2.0.0" })
})

// Error handler
app.use(errorHandler)

const PORT = process.env.PORT || 3000

const start = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

start()