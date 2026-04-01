import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { successResponse, errorResponse } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { sanitizeMiddleware } from '../middleware/sanitize'
import { orderLimiter } from '../middleware/rateLimiter'

const router = Router()

const orderSchema = z.object({
  piniKay10kg: z.coerce.number().min(0).max(9999).default(0),
  firestarters8: z.coerce.number().min(0).max(9999).default(0),
  paymentMethod: z.enum(['online', 'invoice']),
  name: z.string().min(2).max(50),
  phone: z.string().min(7).max(20),
  email: z.string().email().optional().or(z.literal('')),
  establishment: z.string().min(2).max(100),
  establishmentType: z.enum(['RESTAURANT', 'CAFE', 'SHAWARMA', 'DELIVERY', 'OTHER']),
  city: z.string().min(2).max(50),
  comment: z.string().max(500).optional(),
  privacyConsent: z.literal(true),
  inn: z.string().optional(),
  organizationName: z.string().optional(),
  website: z.string().optional(), // honeypot
})

function generateOrderNumber() {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `ORD${year}${month}${day}-${random}`
}

const PRICES = {
  piniKay10kg: { productSku: 'PKB-10', price: 890, wholesalePrice: 750, wholesaleMin: 20 },
  firestarters8: { productSku: 'PFR-8', price: 120, wholesalePrice: 84, wholesaleMin: 50 },
}

// POST /api/v1/orders
router.post('/', orderLimiter, sanitizeMiddleware, async (req: Request, res: Response) => {
  // Honeypot check
  if (req.body.website) {
    return successResponse(res, { message: 'OK' }) // silently reject bots
  }

  const parsed = orderSchema.safeParse(req.body)
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({ field: String(i.path.join('.')), message: i.message }))
    return errorResponse(res, 422, 'VALIDATION_ERROR', 'Ошибка валидации', details)
  }

  const data = parsed.data

  // Check at least one item
  if (!data.piniKay10kg && !data.firestarters8) {
    return errorResponse(res, 422, 'VALIDATION_ERROR', 'Выберите хотя бы один товар')
  }

  // Calculate items and totals
  let subtotal = 0
  let discountAmount = 0
  const items = []

  for (const [key, config] of Object.entries(PRICES)) {
    const qty = data[key as keyof typeof PRICES] as number
    if (!qty) continue

    const product = await prisma.product.findUnique({ where: { sku: config.productSku } })
    if (!product) continue

    const isWholesale = qty >= config.wholesaleMin
    const unitPrice = isWholesale ? config.wholesalePrice : config.price
    const discount = isWholesale ? (config.price - config.wholesalePrice) * qty : 0

    subtotal += config.price * qty
    discountAmount += discount

    items.push({
      productId: product.id,
      quantity: qty,
      price: unitPrice,
      subtotal: unitPrice * qty,
    })
  }

  const totalAmount = subtotal - discountAmount

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      status: data.paymentMethod === 'online' ? 'PENDING_PAYMENT' : 'AWAITING_INVOICE',
      paymentMethod: data.paymentMethod === 'online' ? 'ONLINE' : 'INVOICE',
      name: data.name,
      phone: data.phone.replace(/[\s\-\(\)]/g, ''),
      email: data.email || null,
      establishment: data.establishment,
      establishmentType: data.establishmentType,
      city: data.city,
      comment: data.comment || null,
      inn: data.inn || null,
      organizationName: data.organizationName || null,
      subtotal,
      discountAmount,
      totalAmount,
      ipAddress: req.ip ?? null,
      userAgent: String(req.headers['user-agent'] ?? ''),
      items: {
        create: items,
      },
    },
    include: { items: { include: { product: true } } },
  })

  // TODO: Send email notifications
  // TODO: Create YooKassa payment if online

  return successResponse(res, {
    id: order.id,
    orderNumber: order.orderNumber,
    totalAmount: order.totalAmount,
    status: order.status,
    paymentUrl: null, // Will be set after YooKassa integration
  }, 201)
})

// GET /api/v1/orders - Admin only
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20
  const search = String(req.query.search || '')
  const status = String(req.query.status || '')

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { orderNumber: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { items: { include: { product: true } } },
    }),
    prisma.order.count({ where }),
  ])

  return successResponse(res, orders, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  })
})

// GET /api/v1/orders/export - CSV export
router.get('/export', authMiddleware, async (req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1000,
  })

  const headers = ['№ Заявки', 'Имя', 'Телефон', 'Email', 'Заведение', 'Город', 'Сумма', 'Оплата', 'Статус', 'Дата']
  const rows = orders.map(o => [
    o.orderNumber,
    o.name,
    o.phone,
    o.email || '',
    o.establishment,
    o.city,
    o.totalAmount.toString(),
    o.paymentMethod,
    o.status,
    o.createdAt.toISOString(),
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`)
  res.send('\ufeff' + csv) // BOM for Excel
})

// PATCH /api/v1/orders/:id/status - Admin
router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id)
  const { status } = req.body

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  })

  return successResponse(res, order)
})

// DELETE /api/v1/orders/:id - Admin
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.order.delete({ where: { id: String(req.params.id) } })
  return successResponse(res, { deleted: true })
})

export default router
