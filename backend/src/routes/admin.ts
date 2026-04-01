import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { successResponse, errorResponse } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { authLimiter } from '../middleware/rateLimiter'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// POST /api/v1/admin/login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 422, 'VALIDATION_ERROR', 'Неверный email или пароль')
  }

  const { email, password } = parsed.data

  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin) {
    return errorResponse(res, 401, 'UNAUTHORIZED', 'Неверный email или пароль')
  }

  const isValid = await bcrypt.compare(password, admin.password)
  if (!isValid) {
    return errorResponse(res, 401, 'UNAUTHORIZED', 'Неверный email или пароль')
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '7d' }
  )

  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  return successResponse(res, { id: admin.id, email: admin.email, name: admin.name, role: admin.role })
})

// POST /api/v1/admin/logout
router.post('/logout', authMiddleware, (_req, res) => {
  res.clearCookie('admin_token')
  return successResponse(res, { message: 'Выход выполнен' })
})

// GET /api/v1/admin/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.admin!.id },
    select: { id: true, email: true, name: true, role: true },
  })
  if (!admin) return errorResponse(res, 404, 'NOT_FOUND', 'Пользователь не найден')
  return successResponse(res, admin)
})

// GET /api/v1/admin/stats
router.get('/stats', authMiddleware, async (_req, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [todayOrders, monthRevenue, totalClients, paidOrders, totalOrders] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'CONFIRMED', 'DELIVERED'] },
        createdAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.findMany({ select: { phone: true }, distinct: ['phone'] }).then(r => r.length),
    prisma.order.count({ where: { status: { in: ['PAID', 'CONFIRMED', 'DELIVERED'] } } }),
    prisma.order.count(),
  ])

  return successResponse(res, {
    todayOrders,
    monthRevenue: monthRevenue._sum.totalAmount || 0,
    totalClients,
    conversion: totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0,
  })
})

export default router
