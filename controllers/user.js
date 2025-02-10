import { StatusCodes } from 'http-status-codes'
import User from '../models/user.js'
import jwt from 'jsonwebtoken'

export const create = async (req, res) => {
  try {
    await User.create(req.body)
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
    })
  } catch (error) {
    console.log(error)
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

export const login = async (req, res) => {
  try {
    // jwt.sign(儲存資料, SECRET, 設定)
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    req.user.tokens.push(token)
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      // result 回一些前端需要用到的資訊
      // postman 會收到的 response 就是這些
      result: {
        token,
        username: req.user.username,
        role: req.user.role,
      },
    })
  } catch (error) {
    console.log('controllers/user.js', error)
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
      // 沒有要做購物車
    },
  })
}
