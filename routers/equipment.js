import { Router } from 'express'
import * as equipment from '../controllers/equipment.js'
import * as auth from '../middlewares/auth.js'
import upload from '../middlewares/upload.js'

const router = Router()

// middlewares 分別是：
// 驗證 token
// 驗證有管理員身分
// 上傳圖片（不要放在驗證使用者權限前面，不然上傳了才發現權限不足就浪費空間了）
router.post('/', auth.jwt, auth.admin, upload, equipment.create)

export default router
