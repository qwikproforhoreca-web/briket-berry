import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../utils/prisma'
import { successResponse, errorResponse } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

/** Единый формат телефона для уникальности (только цифры, РФ: 7XXXXXXXXXX) */
function normalizePhoneRu(raw: string): string {
  let d = raw.replace(/\D/g, '')
  if (d.length === 11 && d.startsWith('8')) d = `7${d.slice(1)}`
  if (d.length === 10 && !d.startsWith('7')) d = `7${d}`
  return d
}

const clientBodySchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(7).max(24),
  email: z.string().email().optional().or(z.literal('')),
  establishment: z.string().min(2).max(120),
  establishmentType: z.enum(['RESTAURANT', 'CAFE', 'SHAWARMA', 'DELIVERY', 'OTHER']),
  city: z.string().min(2).max(60),
  inn: z.string().max(20).optional().or(z.literal('')),
  organizationName: z.string().max(200).optional().or(z.literal('')),
  notes: z.string().max(5000).optional().or(z.literal('')),
})

const clientUpdateSchema = clientBodySchema.partial()

router.use(authMiddleware)

// GET /api/v1/clients
router.get('/', async (req: AuthRequest, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20))
  const search = String(req.query.search || '').trim()

  const where: Prisma.ClientWhereInput =
    search.length > 0
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { establishment: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.client.count({ where }),
  ])

  return successResponse(res, clients, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  })
})

// GET /api/v1/clients/:id
router.get('/:id', async (req, res) => {
  const client = await prisma.client.findUnique({ where: { id: String(req.params.id) } })
  if (!client) return errorResponse(res, 404, 'NOT_FOUND', 'Клиент не найден')
  return successResponse(res, client)
})

// POST /api/v1/clients
router.post('/', async (req: AuthRequest, res) => {
  const parsed = clientBodySchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 422, 'VALIDATION_ERROR', 'Проверьте поля формы')
  }
  const body = parsed.data
  const phone = normalizePhoneRu(body.phone)
  if (phone.length < 10) {
    return errorResponse(res, 422, 'VALIDATION_ERROR', 'Укажите корректный телефон')
  }

  try {
    const client = await prisma.client.create({
      data: {
        name: body.name.trim(),
        phone,
        email: body.email?.trim() || null,
        establishment: body.establishment.trim(),
        establishmentType: body.establishmentType,
        city: body.city.trim(),
        inn: body.inn?.trim() || null,
        organizationName: body.organizationName?.trim() || null,
        notes: body.notes?.trim() || null,
      },
    })
    return successResponse(res, client, 201)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return errorResponse(res, 409, 'DUPLICATE_PHONE', 'Клиент с таким телефоном уже есть')
    }
    throw e
  }
})

// PATCH /api/v1/clients/:id
router.patch('/:id', async (req: AuthRequest, res) => {
  const parsed = clientUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 422, 'VALIDATION_ERROR', 'Проверьте поля формы')
  }
  const body = parsed.data
  const id = String(req.params.id)

  const existing = await prisma.client.findUnique({ where: { id } })
  if (!existing) return errorResponse(res, 404, 'NOT_FOUND', 'Клиент не найден')

  let phone: string | undefined
  if (body.phone !== undefined) {
    phone = normalizePhoneRu(body.phone)
    if (phone.length < 10) {
      return errorResponse(res, 422, 'VALIDATION_ERROR', 'Укажите корректный телефон')
    }
  }

  try {
    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(phone !== undefined && { phone }),
        ...(body.email !== undefined && { email: body.email?.trim() || null }),
        ...(body.establishment !== undefined && { establishment: body.establishment.trim() }),
        ...(body.establishmentType !== undefined && { establishmentType: body.establishmentType }),
        ...(body.city !== undefined && { city: body.city.trim() }),
        ...(body.inn !== undefined && { inn: body.inn?.trim() || null }),
        ...(body.organizationName !== undefined && { organizationName: body.organizationName?.trim() || null }),
        ...(body.notes !== undefined && { notes: body.notes?.trim() || null }),
      },
    })
    return successResponse(res, client)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return errorResponse(res, 409, 'DUPLICATE_PHONE', 'Клиент с таким телефоном уже есть')
    }
    throw e
  }
})

// DELETE /api/v1/clients/:id
router.delete('/:id', async (req, res) => {
  const id = String(req.params.id)
  const existing = await prisma.client.findUnique({ where: { id } })
  if (!existing) return errorResponse(res, 404, 'NOT_FOUND', 'Клиент не найден')
  await prisma.client.delete({ where: { id } })
  return successResponse(res, { deleted: true })
})

export default router
