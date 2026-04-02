import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { successResponse, errorResponse } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { prisma } from '../utils/prisma'

const router = Router()

const absoluteUrl = (req: Request, relative: string) => {
  const proto = req.headers['x-forwarded-proto']?.toString().split(',')[0] || req.protocol
  const host = req.get('host')
  return `${proto}://${host}${relative}`
}

const UPLOAD_DIR = path.join(__dirname, '../../uploads')

// Ensure upload directories exist
;['videos', 'images', 'reviews'].forEach((dir) => {
  const dirPath = path.join(UPLOAD_DIR, dir)
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })
})

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const type = req.body?.type || 'images'
    const dir = type === 'video' || type === 'hero' || type === 'tutorial' ? 'videos' : 'images'
    cb(null, path.join(UPLOAD_DIR, dir))
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, name)
  },
})

const videoUpload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime']
    cb(null, allowed.includes(file.mimetype))
  },
})

const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    cb(null, allowed.includes(file.mimetype))
  },
})

// POST /api/v1/upload/video
router.post('/video', authMiddleware, videoUpload.single('video'), async (req: AuthRequest, res: Response) => {
  const multerReq = req as AuthRequest & { file?: Express.Multer.File }
  if (!multerReq.file) return errorResponse(res, 400, 'UPLOAD_ERROR', 'Файл не загружен')

  const url = `/uploads/videos/${multerReq.file.filename}`
  const type = req.body?.type || 'hero'

  const settingKey = type === 'tutorial' ? 'tutorial.videoUrl' : 'hero.videoUrl'
  await prisma.setting.upsert({
    where: { key: settingKey },
    update: { value: url },
    create: { key: settingKey, value: url, label: 'Video URL', type: 'URL', group: 'video' },
  })

  return successResponse(res, { url, absoluteUrl: absoluteUrl(req, url) })
})

// POST /api/v1/upload/image
router.post('/image', authMiddleware, imageUpload.single('image'), async (req: AuthRequest, res: Response) => {
  const multerReq = req as AuthRequest & { file?: Express.Multer.File }
  if (!multerReq.file) return errorResponse(res, 400, 'UPLOAD_ERROR', 'Файл не загружен')

  const url = `/uploads/images/${multerReq.file.filename}`
  return successResponse(res, { url, absoluteUrl: absoluteUrl(req, url) })
})

export default router
