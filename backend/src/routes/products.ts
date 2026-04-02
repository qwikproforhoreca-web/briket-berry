import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { successResponse, errorResponse } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

type PrismaProductCategory = 'BRIQUETTES' | 'FIRESTARTERS'

const toSlug = (input: unknown) => {
  const s = String(input || '')
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/(^-|-$)/g, '')
}

const normalizeCategory = (value: unknown): PrismaProductCategory | undefined => {
  const v = String(value || '').trim().toLowerCase()
  if (v === 'briquettes') return 'BRIQUETTES'
  if (v === 'firestarters') return 'FIRESTARTERS'
  if (v === 'брекеты' || v === 'брекеты pini kay') return 'BRIQUETTES'
  if (v === 'разжигатели') return 'FIRESTARTERS'
  if (v === 'briquettes'.toUpperCase().toLowerCase()) return 'BRIQUETTES'
  if (v === 'firestarters'.toUpperCase().toLowerCase()) return 'FIRESTARTERS'
  return undefined
}

const normalizeNumber = (value: unknown) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function normalizeCreateBody(body: any) {
  const name = String(body.name || '').trim()
  const sku = String(body.sku || '').trim()
  const description = String(body.description || '').trim()
  const slug = body.slug ? String(body.slug) : toSlug(name)
  const shortDesc =
    body.shortDesc
      ? String(body.shortDesc)
      : (description ? description.slice(0, 140) : name)
  const category = normalizeCategory(body.category)
  const price = normalizeNumber(body.price)
  const priceWholesale = normalizeNumber(body.priceWholesale ?? body.wholesalePrice)
  const weight = normalizeNumber(body.weight) ?? 0
  const images = Array.isArray(body.images) ? body.images : []
  const specs = typeof body.specs !== 'undefined' ? body.specs : {}

  return {
    name,
    sku,
    slug,
    shortDesc,
    description,
    category,
    price,
    priceWholesale,
    weight,
    images,
    specs,
  }
}

function normalizeUpdateBody(body: any) {
  const data: Record<string, unknown> = {}

  if (typeof body.name !== 'undefined') data.name = String(body.name).trim()
  if (typeof body.sku !== 'undefined') data.sku = String(body.sku).trim()
  if (typeof body.slug !== 'undefined') data.slug = String(body.slug).trim()
  if (typeof body.description !== 'undefined') data.description = String(body.description)
  if (typeof body.shortDesc !== 'undefined') data.shortDesc = String(body.shortDesc)

  const category = normalizeCategory(body.category)
  if (category) data.category = category

  const price = normalizeNumber(body.price)
  if (typeof price === 'number') data.price = price

  const priceWholesale = normalizeNumber(body.priceWholesale ?? body.wholesalePrice)
  if (typeof priceWholesale === 'number') data.priceWholesale = priceWholesale

  const weight = normalizeNumber(body.weight)
  if (typeof weight === 'number') data.weight = weight

  if (Array.isArray(body.images)) data.images = body.images
  if (typeof body.specs !== 'undefined') data.specs = body.specs
  if (typeof body.inStock === 'boolean') data.inStock = body.inStock
  if (typeof body.featured === 'boolean') data.featured = body.featured
  if (typeof body.sortOrder !== 'undefined') data.sortOrder = Number(body.sortOrder) || 0

  return data
}

async function ensureDefaultProducts() {
  const defaults = [
    {
      sku: 'PKB-10',
      slug: 'pini-kay-10',
      category: 'BRIQUETTES' as PrismaProductCategory,
      name: 'Угольные брикеты Pini Kay',
      shortDesc: '10 кг — 1 ящик',
      description:
        'Профессиональные угольные брикеты для хосперов, мангалов и гриль-печей. Берёзовая древесина без химических добавок.',
      price: 890,
      priceWholesale: 750,
      wholesaleMinQty: 20,
      weight: 10,
      images: ['/images/pini-kay-10.jpg'],
      specs: { 'Время горения': 'До 8 часов горения', 'Температура': '900°C температура', 'Без дыма и запаха': 'Без дыма и запаха' },
    },
    {
      sku: 'PFR-8',
      slug: 'firestarters-8',
      category: 'FIRESTARTERS' as PrismaProductCategory,
      name: 'Парафиновый розжиг',
      shortDesc: '8 кубиков в упаковке',
      description: 'Натуральный парафиновый розжиг без запаха. Поджигает уголь за 5-7 минут. Без химии.',
      price: 120,
      priceWholesale: 90,
      wholesaleMinQty: 50,
      weight: 8,
      images: ['/images/firestarters-8.jpg'],
      specs: { 'Время горения': '10 минут горения', 'Без химии': 'Без химии', 'Розжиг': 'Розжиг за 5-7 минут' },
    },
  ]

  await Promise.all(
    defaults.map((p) =>
      prisma.product.upsert({
        where: { sku: p.sku },
        update: {},
        create: {
          ...p,
          inStock: true,
          featured: true,
        },
      })
    )
  )
}

const MAX_PRODUCTS = 30

const toAbsoluteUploadUrl = (req: Request, url: string) => {
  if (!url.startsWith('/uploads/')) return url
  const proto = req.headers['x-forwarded-proto']?.toString().split(',')[0] || req.protocol
  const host = req.get('host')
  return `${proto}://${host}${url}`
}

const mapProductImagesToAbsolute = (req: Request, product: any) => {
  const images = Array.isArray(product?.images) ? product.images.map((u: string) => toAbsoluteUploadUrl(req, String(u))) : []
  return { ...product, images }
}

// GET /api/v1/products - Public
router.get('/', async (req: Request, res: Response) => {
  await ensureDefaultProducts()
  const category = req.query.category as string | undefined
  const where: any = {}
  if (category) where.category = category

  const products = await prisma.product.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  })

  return successResponse(res, products.map((p) => mapProductImagesToAbsolute(req, p)))
})

// GET /api/v1/products/:id - Public
router.get('/:id', async (req: Request, res: Response) => {
  const id = String(req.params.id)
  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  })

  if (!product) return errorResponse(res, 404, 'NOT_FOUND', 'Продукт не найден')
  return successResponse(res, mapProductImagesToAbsolute(req, product))
})

// POST /api/v1/products - Admin
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const total = await prisma.product.count()
  if (total >= MAX_PRODUCTS) {
    return errorResponse(res, 400, 'PRODUCT_LIMIT_REACHED', `Достигнут лимит товаров: ${MAX_PRODUCTS}`)
  }

  const body = req.body || {}
  const { name, sku, slug, shortDesc, description, category, price, priceWholesale, weight, images, specs } = normalizeCreateBody(body)

  if (!name || !sku || !slug || !shortDesc || price === undefined || !category) {
    return errorResponse(
      res,
      400,
      'VALIDATION_ERROR',
      'Не хватает обязательных полей (name, sku, slug, shortDesc, price, category)'
    )
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        description: description || name,
        shortDesc,
        price,
        ...(priceWholesale !== undefined ? { priceWholesale } : {}),
        category,
        weight,
        ...(Array.isArray(images) ? { images } : {}),
        specs,
        ...(typeof body.inStock === 'boolean' ? { inStock: body.inStock } : {}),
        ...(typeof body.featured === 'boolean' ? { featured: body.featured } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) || 0 } : {}),
      },
    })

    return successResponse(res, mapProductImagesToAbsolute(req, product), 201)
  } catch (e: any) {
    const code = e?.code || ''
    if (code === 'P2002') {
      return errorResponse(res, 400, 'DUPLICATE_VALUE', 'SKU или slug уже существует')
    }
    return errorResponse(res, 500, 'CREATE_FAILED', 'Не удалось создать товар')
  }
})

// POST /api/v1/products/seed-defaults - Admin
router.post('/seed-defaults', authMiddleware, async (_req: AuthRequest, res: Response) => {
  await ensureDefaultProducts()
  const products = await prisma.product.findMany({ orderBy: { sortOrder: 'asc' } })
  return successResponse(res, { seeded: true, count: products.length })
})

// PUT /api/v1/products/:id - Admin
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const data = normalizeUpdateBody(req.body || {})
  try {
    const product = await prisma.product.update({
      where: { id: String(req.params.id) },
      data,
    })
    return successResponse(res, mapProductImagesToAbsolute(req, product))
  } catch (e: any) {
    const code = e?.code || ''
    if (code === 'P2002') {
      return errorResponse(res, 400, 'DUPLICATE_VALUE', 'SKU или slug уже существует')
    }
    if (code === 'P2025') {
      return errorResponse(res, 404, 'NOT_FOUND', 'Товар не найден')
    }
    return errorResponse(res, 500, 'UPDATE_FAILED', 'Не удалось сохранить товар')
  }
})

// DELETE /api/v1/products/:id - Admin
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.product.delete({ where: { id: String(req.params.id) } })
  return successResponse(res, { deleted: true })
})

export default router
