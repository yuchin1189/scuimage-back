import { Schema, model } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import UserRole from '../enums/UserRole.js'

const schema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'usernameRequired'],
      minlength: [4, 'usernameTooShort'],
      maxlength: [30, 'usernameTooLong'],
      unique: true, // 帳號不能用別人取過的
      validate: {
        validator(value) {
          return validator.isAlphanumeric(value)
        },
        message: 'usernameInvalid',
      },
    },
    password: {
      type: String,
      required: [true, 'userPasswordRequired'],
      // 密碼的驗證另外分開來寫於其他地方
    },
    email: {
      type: String,
      required: [true, 'userEmailRequired'],
      validate: {
        validator(value) {
          return validator.isEmail(value)
        },
        message: 'userEmailInvalid',
      },
    },
    tokens: {
      // jwt 被存在這個陣列裡面
      type: [String],
    },
    role: {
      type: Number,
      default: UserRole.VISITOR,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

// mongoose 驗證後，存入資料庫前執行動作
schema.pre('save', function (next) {
  const user = this
  // 密碼欄位有修改再處理
  console.log('modified', user.isModified('password'))
  if (user.isModified('password')) {
    // 自己寫驗證
    if (user.password < 4) {
      const error = new Error.ValidationError()
      error.addError('password', new Error.ValidatorError({ message: 'userPasswordTooShort' }))
      next(error)
    } else if (user.password.length > 30) {
      const error = new Error.ValidationError()
      error.addError('password', new Error.ValidatorError({ message: 'userPasswordTooLong' }))
      next(error)
    } else {
      // 密碼驗證沒問題，用 bcrypt 加密。
      user.password = bcrypt.hashSync(user.password, 10)
    }
  }
  next()
})

export default model('users', schema)
