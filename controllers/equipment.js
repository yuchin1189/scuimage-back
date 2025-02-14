import { StatusCodes } from 'http-status-codes'
import Equipment from '../models/equipment.js'

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
