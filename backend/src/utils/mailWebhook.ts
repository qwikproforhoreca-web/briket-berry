/**
 * Отправка уведомлений о заявках через PHP на Cloudbell (обход блокировки SMTP с Railway).
 */

import { isOutboundNodeSmtpBlocked } from './mailPolicy'

type OrderItem = {
  quantity: number
  price: unknown
  subtotal: unknown
  productName: string
  sku: string
}

export type OrderWebhookPayload = {
  orderNumber: string
  paymentMethod: 'ONLINE' | 'INVOICE'
  name: string
  phone: string
  email: string | null
  establishment: string
  establishmentType: string
  city: string
  comment: string | null
  inn: string | null
  organizationName: string | null
  totalAmount: unknown
  items: OrderItem[]
}

/** Убираем кавычки/BOM — часто копируют из чата с лишними символами */
function normalizeEnvValue(raw: string | undefined): string {
  if (!raw) return ''
  let v = raw.trim().replace(/^\uFEFF/, '')
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim()
  }
  return v
}

function webhookConfigured() {
  const url = normalizeEnvValue(
    process.env.CLOUDBELL_MAIL_WEBHOOK_URL
      || process.env.BRIKET_BERRY_MAIL_WEBHOOK_URL
      || process.env.MAIL_WEBHOOK_URL,
  )
  const secret = normalizeEnvValue(process.env.MAIL_WEBHOOK_SECRET)
  return { url, secret, ok: Boolean(url && secret) }
}

/** Для отладки в ответе API (без утечки секрета) */
export function getMailWebhookDebug() {
  const { url, secret, ok } = webhookConfigured()
  return {
    ready: ok,
    hasUrl: Boolean(url),
    hasSecret: Boolean(secret),
    nodeSmtpBlocked: isOutboundNodeSmtpBlocked(),
    urlHost: url ? (() => {
      try {
        return new URL(url).host
      } catch {
        return 'invalid-url'
      }
    })() : '',
  }
}

export function isCloudbellMailWebhookEnabled() {
  return webhookConfigured().ok
}

async function postWebhook(body: Record<string, unknown>) {
  const { url, secret, ok } = webhookConfigured()
  if (!ok) {
    throw new Error(
      'CLOUDBELL_MAIL_WEBHOOK_URL (или MAIL_WEBHOOK_URL) и MAIL_WEBHOOK_SECRET не заданы в окружении процесса',
    )
  }

  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), 25000)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': secret,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const text = await res.text()
    let json: { ok?: boolean; error?: string; recipients?: string[] } = {}
    try {
      json = JSON.parse(text) as typeof json
    } catch {
      /* ignore */
    }
    if (!res.ok || !json.ok) {
      throw new Error(json.error || `HTTP ${res.status}: ${text.slice(0, 200)}`)
    }
    return { sent: true as const, recipients: Array.isArray(json.recipients) ? json.recipients : [] }
  } finally {
    clearTimeout(t)
  }
}

export async function notifyOrderViaCloudbell(order: OrderWebhookPayload) {
  return postWebhook({
    type: 'order',
    order: {
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
      totalAmount: String(order.totalAmount),
      items: order.items.map((i) => ({
        productName: i.productName,
        sku: i.sku,
        quantity: i.quantity,
        price: String(i.price),
        subtotal: String(i.subtotal),
      })),
    },
  })
}

export async function sendTestViaCloudbell() {
  return postWebhook({ type: 'test' })
}
