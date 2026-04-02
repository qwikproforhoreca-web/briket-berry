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
  'email.smtpHost',
  'email.smtpPort',
  'email.user',
  'email.password',
  'email.notifyTo',
  'email.fromName',
] as const

type EmailConfig = {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  recipients: string[]
  fromName: string
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
    smtpHost: (map['email.smtpHost'] || '').trim(),
    smtpPort: Number(map['email.smtpPort'] || 0),
    smtpUser: (map['email.user'] || '').trim(),
    smtpPassword: (map['email.password'] || '').trim(),
    recipients: parseEmails(map['email.notifyTo'] || ''),
    fromName: (map['email.fromName'] || 'Брикет-Бери').trim(),
  }
}

export async function sendOrderNotificationEmail(order: OrderForEmail) {
  const { smtpHost, smtpPort, smtpUser, smtpPassword, recipients, fromName } = await loadEmailConfig()

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || recipients.length === 0) {
    console.warn('⚠️ Email notifications skipped: SMTP settings incomplete')
    return { sent: false, reason: 'SMTP settings incomplete' as const }
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  })

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

  await transporter.sendMail({
    from: `"${fromName}" <${smtpUser}>`,
    to: recipients.join(','),
    subject,
    text,
    html,
  })

  return { sent: true as const, recipients }
}

export async function sendSmtpTestEmail() {
  const { smtpHost, smtpPort, smtpUser, smtpPassword, recipients, fromName } = await loadEmailConfig()

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || recipients.length === 0) {
    return { sent: false as const, reason: 'SMTP settings incomplete' as const }
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  })

  const now = new Date()
  await transporter.sendMail({
    from: `"${fromName}" <${smtpUser}>`,
    to: recipients.join(','),
    subject: `Тест SMTP — Брикет-Бери (${now.toLocaleString('ru-RU')})`,
    text: [
      'Это тестовое письмо SMTP от briket-berry.ru',
      `Дата: ${now.toISOString()}`,
      `Хост: ${smtpHost}:${smtpPort}`,
      `Получатели: ${recipients.join(', ')}`,
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
        <h3 style="margin:0 0 10px;">Тест SMTP — Брикет-Бери</h3>
        <p style="margin:0 0 8px;">Проверка отправки писем выполнена успешно.</p>
        <p style="margin:0 0 4px;"><b>Дата:</b> ${now.toLocaleString('ru-RU')}</p>
        <p style="margin:0 0 4px;"><b>SMTP:</b> ${smtpHost}:${smtpPort}</p>
        <p style="margin:0;"><b>Получатели:</b> ${recipients.join(', ')}</p>
      </div>
    `,
  })

  return { sent: true as const, recipients }
}
