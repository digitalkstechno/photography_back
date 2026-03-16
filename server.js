import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import routes from "./src/routes/index.js"
import { errorHandler } from "./src/middlewares/errorHandler.js"

dotenv.config()

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// API routes
app.use("/api", routes)

// Health check
app.get("/", (req, res) => {
    res.json({ message: "Photography Billing API running", version: "1.0.0" })
})

// Error handler
app.use(errorHandler)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})