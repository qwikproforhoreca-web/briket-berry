/**
 * На Railway исходящий TCP к внешним SMTP (465/587) часто режется — не дергаем nodemailer.
 * Для локальной разработки: переменных Railway нет → SMTP из админки работает как раньше.
 * Обход: ALLOW_NODE_SMTP=true (редко нужно).
 */
export function isOutboundNodeSmtpBlocked(): boolean {
  if (process.env.ALLOW_NODE_SMTP === 'true') {
    return false
  }
  return Boolean(
    process.env.RAILWAY_ENVIRONMENT
    || process.env.RAILWAY_PROJECT_ID
    || process.env.RAILWAY_SERVICE_ID,
  )
}

export const MAIL_WEBHOOK_REQUIRED_RU =
  'Почта с этого сервера только через webhook на ваш хостинг: в Railway у сервиса API задайте CLOUDBELL_MAIL_WEBHOOK_URL (https://briket-berry.ru/mail/mail-order.php) и MAIL_WEBHOOK_SECRET (как webhook_secret в mail-config.php), затем Redeploy. Прямой SMTP с Railway к Яндексу заблокирован сетью платформы.'
