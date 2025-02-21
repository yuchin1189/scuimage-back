import { StatusCodes } from 'http-status-codes'
import User from '../models/user.js'
import jwt from 'jsonwebtoken'

export const create = async (req, res) => {
  try {
    console.log('req.body', req.body)
    await User.create(req.body)
    res.status(StatusCodes.OK).json({
      success: true,
      message: '註冊成功',
    })
  } catch (error) {
    console.log('controllers/user.js create', error)
    if (error.name === 'MongoServerError' && error.code === 11000) {
      // res.status(409) // res.status(400)
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'usernameDuplicate',
      })
    } else if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.errors[key].message,
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'serverError',
      })
    }
  }
}

// 從前端（postman 或 github.io 或 localhost 或 127.0.0.1）過來的請求會到這裡
export const login = async (req, res) => {
  try {
    // jwt.sign(儲存資料, SECRET, 設定)
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    req.user.tokens.push(token)
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      // result 回傳前端所需資訊
      // postman 會看到的 response 就是這些
      result: {
        // 之後要使用這三個東西的話，會在 res.result 內
        token,
        username: req.user.username,
        role: req.user.role,
      },
    })
  } catch (error) {
    console.log('controllers/user.js login', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}

export const profile = async (req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result: {
      username: req.user.username,
      role: req.user.role,
    },
  })
}

export const refresh = async (req, res) => {
  try {
    const idx = req.user.tokens.findIndex((token) => token === req.token)
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    req.user.tokens[idx] = token
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: token,
    })
  } catch (error) {
    console.log('controllers/user.js refresh error', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}

export const logout = async (req, res) => {
  try {
    const idx = req.user.tokens.findIndex((token) => token === req.token)
    req.user.tokens.splice(idx, 1)
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
    })
  } catch (error) {
    console.log('controllers/user.js logout error', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}
