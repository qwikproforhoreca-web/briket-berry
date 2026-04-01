import { Router, Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { successResponse, errorResponse } from '../utils/response'

const router = Router()

// POST /api/v1/payment/create
router.post('/create', async (req: Request, res: Response) => {
  const { orderId } = req.body

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return errorResponse(res, 404, 'NOT_FOUND', 'Заявка не найдена')

  // YooKassa integration would go here
  // For now, return placeholder
  return successResponse(res, {
    paymentId: 'placeholder',
    confirmationUrl: `${process.env.YOOKASSA_RETURN_URL}?orderId=${orderId}`,
  })
})

// POST /api/v1/payment/webhook - YooKassa webhook
router.post('/webhook', async (req: Request, res: Response) => {
  const { event, object } = req.body

  if (event === 'payment.succeeded') {
    const orderId = object?.metadata?.orderId
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      })

      await prisma.payment.updateMany({
        where: { orderId },
        data: { status: 'SUCCEEDED', paidAt: new Date() },
      })
    }
  }

  res.status(200).json({ success: true })
})

// GET /api/v1/payment/:id/status
router.get('/:id/status', async (req: Request, res: Response) => {
  const payment = await prisma.payment.findUnique({ where: { id: String(req.params.id) } })
  if (!payment) return errorResponse(res, 404, 'NOT_FOUND', 'Платёж не найден')
  return successResponse(res, { status: payment.status })
})

export default router
