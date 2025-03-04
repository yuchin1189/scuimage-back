import { StatusCodes } from 'http-status-codes'
import Equipment from '../models/equipment.js'
import validator from 'validator'

export const create = async (req, res) => {
  try {
    // 圖片上傳，沒圖片的話就會在欄位傳送空字串，錯誤訊息就會正常回覆
    req.body.image = req.file?.path || ''
    const result = await Equipment.create(req.body)
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result,
    })
  } catch (error) {
    console.log('controllers/equipment.js create', error)
    if (error.name === 'ValidationError') {
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

export const get = async (req, res) => {
  try {
    const result = await Equipment.find() // 上架的商品（所有社團器材皆顯示，故不分上下架一律顯示
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result,
    })
  } catch (error) {
    console.log('controllers/equipment.js get', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}

export const getAll = async (req, res) => {
  try {
    const result = await Equipment.find()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result,
    })
  } catch (error) {
    console.log('controllers/equipment.js getAll', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}

export const getId = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')
    const result = await Equipment.findById(req.params.id).orFail(new Error('NOT FOUND'))
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result,
    })
  } catch (error) {
    console.log('controllers/equipment.js getId', error)
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'equipmentIdInvalid',
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'equipmentNotFound',
      })
    } else if (error.message === 'INTERNAL_SERVER_ERROR') {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'serverError',
      })
    }
  }
}

export const edit = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')

    req.body.image = req.file?.path // 若編輯時未提供圖片，則 image 欄位 undefined，原本的圖片不變
    const result = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    }).orFail(new Error('NOT FOUND'))
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result,
    })
  } catch (error) {
    console.log('controllers/equipment.js edit', error)
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'equipmentIdInvalid',
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'equipmentNotFound',
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
