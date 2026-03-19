import { authService } from "../services/auth.service.js"

export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body)
    res.status(201).json({ success: true, data: user, message: "User registered successfully" })
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" })
    }
    const result = await authService.login(email, password)
    res.json({ success: true, data: result, message: "Login successful" })
  } catch (err) {
    next(err)
  }
}

export const getUsers = async (req, res, next) => {
  try {
    const users = await authService.findAll()
    res.json({ success: true, data: users })
  } catch (err) {
    next(err)
  }
}

export const getUserById = async (req, res, next) => {
  try {
    const user = await authService.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

export const updateUser = async (req, res, next) => {
  try {
    const user = await authService.update(req.params.id, req.body)
    res.json({ success: true, data: user, message: "User updated" })
  } catch (err) {
    next(err)
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    await authService.remove(req.params.id)
    res.json({ success: true, message: "User deleted" })
  } catch (err) {
    next(err)
  }
}

export const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user })
  } catch (err) {
    next(err)
  }
}