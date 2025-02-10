import passport from 'passport'
import { StatusCodes } from 'http-status-codes'
import jsonwebtoken from 'jsonwebtoken'
import UserRole from '../enums/UserRole.js'

export const login = (req, res, next) => {
  // 使用 passport 的 login 方式驗證
  passport.authenticate('login', { session: false }, (error, user, info) => {
    // 此區的 (error, user, info) 三個參數來自 passport.js 呼叫的 done(1,2,3)，有以下情況：
    // (null, user, null) user 為正確的使用者帳號
    // (null, null, '查無使用者')
    // (null, user, '密碼錯誤')
    // (null, user, '伺服器錯誤')
    if (!user || error) {
      if (info.message === 'Missing Credentials') {
        info.message = 'requestFormatError'
      }
      if (info.message === 'serverError') {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: info.message,
        })
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: info.message,
        })
      }
    }

    // 將通過以上重重驗證的 user 作為 reqest 的 user
    req.user = user
    next()
  })(req, res, next)
}

export const jwt = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, data, info) => {
    if (error || !data) {
      if (info instanceof jsonwebtoken.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'userTokenInvalid',
        })
      } else if (info.message === 'serverError') {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: info.message,
        })
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: info.message,
        })
      }
    }
    req.user = data.user
    req.token = data.token

    next()
  })(req, res, next)
}

export const admin = (req, res, next) => {
  if (req.user.role !== UserRole.ADMIN) {
    res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: 'userPermissionDenied',
    })
  } else {
    next()
  }
}
