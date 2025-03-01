import { Router } from 'express'
import * as equipment from '../controllers/equipment.js'
import * as auth from '../middlewares/auth.js'
import upload from '../middlewares/upload.js'

const router = Router()

router.post('/', auth.jwt, auth.admin, upload, equipment.create)
router.get('/', equipment.get) // 使用者查看上架器材的頁面
router.get('/all', equipment.getAll) // 管理員可以看到所有器材
router.get('/:id', equipment.getId) // 單一個器材的頁面
router.patch('/:id', auth.jwt, auth.admin, upload, equipment.edit) // 編輯器材

export default router
