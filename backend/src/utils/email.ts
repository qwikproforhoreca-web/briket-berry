import nodemailer from 'nodemailer'
import { prisma } from './prisma'

type OrderForEmail = {
  id: string
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
  createdAt?: Date
  items: Array<{
    quantity: number
    price: unknown
    subtotal: unknown
    product: {
      name: string
      sku: string
    }
  }>
}

const EMAIL_KEYS = [
  'email.provider',
  'email.smtpHost',
  'email.smtpPort',
  'email.user',
  'email.password',
  'email.notifyTo',
  'email.fromName',
] as const

// Static recipients requested by business owner (fallback + forced mode).
const STATIC_NOTIFY_RECIPIENTS = [
  'skorobogatov@qwik.pro',
  'pitsenckoolga@yandex.ru',
  'elizaveta@qwik.pro',
]

type EmailConfig = {
  provider: 'smtp' | 'resend'
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  recipients: string[]
  fromName: string
}

type EmailContent = {
  subject: string
  text: string
  html: string
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function formatRub(value: unknown) {
  return `${toNumber(value).toLocaleString('ru-RU')} ₽`
}

function parseEmails(raw: string) {
  return raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

async function loadEmailConfig(): Promise<EmailConfig> {
  const settings = await prisma.setting.findMany({
    where: { key: { in: [...EMAIL_KEYS] } },
  })
  const map = settings.reduce<Record<string, string>>((acc, s) => {
    acc[s.key] = s.value
    return acc
  }, {})

  return {
    // Force SMTP mode (Resend disabled by user request).
    provider: 'smtp',
    smtpHost: (map['email.smtpHost'] || 'smtp.yandex.ru').trim(),
    smtpPort: Number(map['email.smtpPort'] || 465),
    smtpUser: (map['email.user'] || '').trim(),
    smtpPassword: (map['email.password'] || '').trim(),
    recipients: STATIC_NOTIFY_RECIPIENTS,
    fromName: (map['email.fromName'] || 'Брикет-Бери').trim(),
  }
}

function getFromAddress(config: EmailConfig) {
  return (config.smtpUser || '').trim()
}

async function sendViaResend(config: EmailConfig, content: EmailContent) {
  throw new Error('Resend disabled. Use SMTP provider.')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer disabled',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `"${config.fromName}" <${getFromAddress(config)}>`,
        to: config.recipients,
        subject: content.subject,
        html: content.html,
        text: content.text,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const raw = await response.text()
      throw new Error(`Resend API ${response.status}: ${raw}`)
    }
    return { sent: true as const, provider: 'resend' as const, recipients: config.recipients }
  } finally {
    clearTimeout(timeout)
  }
}

async function sendViaSmtp(config: EmailConfig, content: EmailContent) {
  const { smtpHost, smtpPort, smtpUser, smtpPassword } = config
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    return { sent: false as const, reason: 'SMTP settings incomplete' as const }
  }

  const makeTransporter = (port: number, secure: boolean) =>
    nodemailer.createTransport({
      host: smtpHost,
      port,
      secure,
      requireTLS: !secure,
      connectionTimeout: 12000,
      greetingTimeout: 12000,
      socketTimeout: 15000,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    })

  const sendWith = async (port: number, secure: boolean) => {
    const transporter = makeTransporter(port, secure)
    await transporter.sendMail({
      from: `"${config.fromName}" <${smtpUser}>`,
      to: config.recipients.join(','),
      subject: content.subject,
      text: content.text,
      html: content.html,
    })
  }

  const looksLikeYandex = smtpHost.includes('yandex.')
  try {
    await sendWith(smtpPort, smtpPort === 465)
    return { sent: true as const, provider: 'smtp' as const, recipients: config.recipients }
  } catch (e) {
    const msg = String((e as Error).message || '')
    const code = String((e as { code?: string })?.code || '')
    const timeoutLike =
      code === 'ETIMEDOUT' || code === 'ESOCKET' || /timed? out|timeout|Greeting never received/i.test(msg)

    // For Yandex SMTP, automatically fallback between 465 (SSL) and 587 (STARTTLS)
    if (looksLikeYandex && timeoutLike) {
      const fallbackPort = smtpPort === 465 ? 587 : 465
      const fallbackSecure = fallbackPort === 465
      try {
        await sendWith(fallbackPort, fallbackSecure)
        console.warn(`⚠️ SMTP fallback used: ${smtpHost}:${smtpPort} -> ${smtpHost}:${fallbackPort}`)
        return { sent: true as const, provider: 'smtp' as const, recipients: config.recipients }
      } catch (fallbackError) {
        throw new Error(
          `SMTP timeout on ${smtpHost}:${smtpPort} and fallback ${smtpHost}:${fallbackPort}. ${String((fallbackError as Error).message || '')}`,
        )
      }
    }

    throw e
  }
}

async function sendEmail(config: EmailConfig, content: EmailContent) {
  if (config.recipients.length === 0) {
    return { sent: false as const, reason: 'No recipients configured' as const }
  }

  if (config.provider === 'resend') return sendViaResend(config, content)
  return sendViaSmtp(config, content)
}

export async function sendOrderNotificationEmail(order: OrderForEmail) {
  const config = await loadEmailConfig()
  if (config.recipients.length === 0) {
    console.warn('⚠️ Email notifications skipped: recipients not configured')
    return { sent: false as const, reason: 'No recipients configured' as const }
  }

  const paymentLabel = order.paymentMethod === 'ONLINE' ? 'Онлайн' : 'Счёт для юрлиц'
  const itemsHtml = order.items
    .map((item) => {
      return `
        <tr>
          <td style="padding:6px 0;border-bottom:1px solid #eee;">${item.product.name}</td>
          <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;">${formatRub(item.price)}</td>
          <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;">${formatRub(item.subtotal)}</td>
        </tr>
      `
    })
    .join('')

  const itemsText = order.items
    .map((item) => `- ${item.product.name}: ${item.quantity} × ${toNumber(item.price)} ₽ = ${toNumber(item.subtotal)} ₽`)
    .join('\n')

  const subject = `Новая заявка ${order.orderNumber} — Брикет-Бери`
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
      <h2 style="margin:0 0 12px;">Новая заявка с сайта briket-berry.ru</h2>
      <p style="margin:0 0 14px;"><b>№ заявки:</b> ${order.orderNumber}</p>
      <table style="width:100%;max-width:760px;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 0;border-bottom:1px solid #ddd;">Товар</th>
            <th style="text-align:center;padding:6px 0;border-bottom:1px solid #ddd;">Кол-во</th>
            <th style="text-align:right;padding:6px 0;border-bottom:1px solid #ddd;">Цена</th>
            <th style="text-align:right;padding:6px 0;border-bottom:1px solid #ddd;">Сумма</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p><b>Итого:</b> ${formatRub(order.totalAmount)}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:14px 0;" />
      <p><b>Клиент:</b> ${order.name}</p>
      <p><b>Телефон:</b> ${order.phone}</p>
      <p><b>Email:</b> ${order.email || '—'}</p>
      <p><b>Заведение:</b> ${order.establishment} (${order.establishmentType})</p>
      <p><b>Город:</b> ${order.city}</p>
      <p><b>Оплата:</b> ${paymentLabel}</p>
      <p><b>ИНН:</b> ${order.inn || '—'}</p>
      <p><b>Организация:</b> ${order.organizationName || '—'}</p>
      <p><b>Комментарий:</b> ${order.comment || '—'}</p>
    </div>
  `

  const text = [
    `Новая заявка с сайта briket-berry.ru`,
    `№ заявки: ${order.orderNumber}`,
    '',
    'Товары:',
    itemsText || '-',
    '',
    `Итого: ${toNumber(order.totalAmount)} ₽`,
    '',
    `Клиент: ${order.name}`,
    `Телефон: ${order.phone}`,
    `Email: ${order.email || '-'}`,
    `Заведение: ${order.establishment} (${order.establishmentType})`,
    `Город: ${order.city}`,
    `Оплата: ${paymentLabel}`,
    `ИНН: ${order.inn || '-'}`,
    `Организация: ${order.organizationName || '-'}`,
    `Комментарий: ${order.comment || '-'}`,
  ].join('\n')

  const content: EmailContent = {
    subject,
    text,
    html,
  }

  return sendEmail(config, content)
}

export async function sendSmtpTestEmail() {
  const config = await loadEmailConfig()
  if (config.recipients.length === 0) {
    return { sent: false as const, reason: 'No recipients configured' as const }
  }

  const now = new Date()
  const content: EmailContent = {
    subject: `Тест SMTP — Брикет-Бери (${now.toLocaleString('ru-RU')})`,
    text: [
      'Это тестовое письмо SMTP от briket-berry.ru',
      `Дата: ${now.toISOString()}`,
      'Провайдер: SMTP',
      `Хост: ${config.smtpHost}:${config.smtpPort}`,
      `Получатели: ${config.recipients.join(', ')}`,
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
        <h3 style="margin:0 0 10px;">Тест Email — Брикет-Бери</h3>
        <p style="margin:0 0 8px;">Проверка отправки писем выполнена успешно.</p>
        <p style="margin:0 0 4px;"><b>Провайдер:</b> SMTP</p>
        <p style="margin:0 0 4px;"><b>Дата:</b> ${now.toLocaleString('ru-RU')}</p>
        <p style="margin:0 0 4px;"><b>SMTP:</b> ${config.smtpHost}:${config.smtpPort}</p>
        <p style="margin:0;"><b>Получатели:</b> ${config.recipients.join(', ')}</p>
      </div>
    `,
  }

  return sendEmail(config, content)
}
