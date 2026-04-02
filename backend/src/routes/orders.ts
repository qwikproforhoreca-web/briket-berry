import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { successResponse, errorResponse } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { sanitizeMiddleware } from '../middleware/sanitize'
import { orderLimiter } from '../middleware/rateLimiter'
import { sendOrderNotificationEmail } from '../utils/email'

const router = Router()

const orderSchema = z.object({
  piniKay10kg: z.coerce.number().min(0).max(9999).default(0),
  firestarters8: z.coerce.number().min(0).max(9999).default(0),
  items: z.array(z.object({
    productId: z.string().optional(),
    sku: z.string().optional(),
    quantity: z.coerce.number().int().min(0).max(9999),
  })).optional(),
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

const LEGACY_PRODUCTS = {
  piniKay10kg: 'PKB-10',
  firestarters8: 'PFR-8',
} as const

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

  const hasDynamicItems = Array.isArray(data.items) && data.items.some((i) => i.quantity > 0)

  // Check at least one item (dynamic or legacy)
  if (!hasDynamicItems && !data.piniKay10kg && !data.firestarters8) {
    return errorResponse(res, 422, 'VALIDATION_ERROR', 'Выберите хотя бы один товар')
  }

  // Build normalized order items
  const normalizedItems: Array<{ productId: string; quantity: number }> = []

  if (hasDynamicItems && data.items) {
    for (const row of data.items) {
      if (!row.quantity) continue
      let product = null
      if (row.productId) {
        product = await prisma.product.findUnique({ where: { id: row.productId } })
      }
      if (!product && row.sku) {
        product = await prisma.product.findUnique({ where: { sku: row.sku } })
      }
      if (!product) continue
      normalizedItems.push({ productId: product.id, quantity: row.quantity })
    }
  } else {
    // Legacy support for old frontend
    const legacyRows = [
      { qty: data.piniKay10kg, sku: LEGACY_PRODUCTS.piniKay10kg },
      { qty: data.firestarters8, sku: LEGACY_PRODUCTS.firestarters8 },
    ]
    for (const row of legacyRows) {
      if (!row.qty) continue
      const product = await prisma.product.findUnique({ where: { sku: row.sku } })
      if (!product) continue
      normalizedItems.push({ productId: product.id, quantity: row.qty })
    }
  }

  if (!normalizedItems.length) {
    return errorResponse(res, 422, 'VALIDATION_ERROR', 'Выберите хотя бы один товар')
  }

  // Calculate items and totals from real products
  let subtotal = 0
  let discountAmount = 0
  const items: Array<{ productId: string; quantity: number; price: number; subtotal: number }> = []

  for (const row of normalizedItems) {
    const product = await prisma.product.findUnique({ where: { id: row.productId } })
    if (!product) continue

    const regularPrice = Number(product.price)
    const wholesalePrice = product.priceWholesale ? Number(product.priceWholesale) : regularPrice
    const wholesaleMin = Number(product.wholesaleMinQty || 1)

    const isWholesale = row.quantity >= wholesaleMin
    const unitPrice = isWholesale ? wholesalePrice : regularPrice
    const discount = isWholesale ? (regularPrice - wholesalePrice) * row.quantity : 0

    subtotal += regularPrice * row.quantity
    discountAmount += discount

    items.push({
      productId: product.id,
      quantity: row.quantity,
      price: unitPrice,
      subtotal: unitPrice * row.quantity,
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

  try {
    const emailResult = await sendOrderNotificationEmail({
      id: order.id,
      orderNumber: order.orderNumber,
      paymentMethod: order.paymentMethod,
      name: order.name,
      phone: order.phone,
      email: order.email,
      establishment: order.establishment,
      establishmentType: order.establishmentType,
      city: order.city,
      comment: order.comment,
      inn: order.inn,
      organizationName: order.organizationName,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        product: {
          name: item.product.name,
          sku: item.product.sku,
        },
      })),
    })
    if (emailResult.sent) {
      const recipients = Array.isArray(emailResult.recipients) ? emailResult.recipients : []
      console.log(`📧 Order notification sent: ${order.orderNumber} -> ${recipients.join(', ')}`)
    }
  } catch (e) {
    console.warn(`⚠️ Failed to send order notification for ${order.orderNumber}:`, (e as Error).message)
  }

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
