import { authService } from "../services/auth.service.js"

export const register = async (req, res, next) => {

  try {

    const user = await authService.register(req.body)

    res.json(user)

  } catch (err) {

    next(err)

  }

}

export const login = async (req, res, next) => {

  try {

    const { email, password } = req.body

    const result = await authService.login(email, password)

    res.json(result)

  } catch (err) {

    next(err)

  }

}