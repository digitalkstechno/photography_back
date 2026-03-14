import express from "express"
import dotenv from "dotenv"

import routes from "./src/routes/index.js"

dotenv.config()

const app = express()

// Middlewares
app.use(express.json())

// API routes
app.use("/api", routes)

// Health check
app.get("/", (req, res) => {
    res.json({ message: "API running" })
})

// Error handler
app.use((err, req, res, next) => {
    console.error(err)

    res.status(500).json({
        message: err.message || "Internal server error"
    })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})