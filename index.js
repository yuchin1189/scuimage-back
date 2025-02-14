import 'dotenv/config'
import mongoose from 'mongoose'
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import routerUser from './routers/user.js'
import routerEquipment from './routers/equipment.js'
import './passport.js'
import cors from 'cors'

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log('✅ 資料庫連線成功')
  })
  .catch((error) => {
    console.log('❌ 資料庫連線失敗， back/index.js', error)
  })

const app = express()

app.use(
  cors({
    origin(origin, callback) {
      // 觀察 origin
      // console.log('origin', origin)
      // postman 沒有 origin，測試用
      if (
        origin === undefined ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('github.io')
      ) {
        callback(null, true)
      } else {
        callback(new Error('CORS', false))
      }
    },
  }),
)

app.use(express.json())
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  res.status(
    StatusCodes.BAD_REQUEST.json({
      sucess: false,
      message: 'requestFormatError',
    }),
  )
})

app.use('/user', routerUser)
app.use('/equipment', routerEquipment)

app.listen(process.env.PORT || 4000, () => {
  console.log('✅ 伺服器啟動')
})
