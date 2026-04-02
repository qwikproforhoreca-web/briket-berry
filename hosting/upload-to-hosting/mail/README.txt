Готовая папка для загрузки на хостинг
====================================

Загрузить ВЕСЬ contents этой папки в:
  www/briket-berry.ru/mail/

Файлы:
  - mail-order.php
  - mail-config.php
  - .htaccess

Далее в Railway -> Variables (именно у сервиса briket-berry, вкладка Variables):
  CLOUDBELL_MAIL_WEBHOOK_URL = https://briket-berry.ru/mail/mail-order.php
  MAIL_WEBHOOK_SECRET        = значение webhook_secret из mail-config.php
  (альтернатива URL: MAIL_WEBHOOK_URL — то же значение, если длинное имя опечатали)

После изменения переменных:
  Apply changes -> Deploy

Бэкенд на Railway больше не вызывает SMTP из Node (таймауты убраны): только webhook.
Опционально для отладки: ALLOW_NODE_SMTP=true — снова разрешить Node SMTP (не рекомендуется на Railway).

Важно:
  1) В mail-config.php вставить реальный пароль приложения Яндекса в smtp_pass
  2) Убедиться, что smtp_user и from_email одинаковые (обычно так стабильнее)
  3) Папка на диске должна открываться как /mail/ (не "mail." с точкой в конце имени)
  4) webhook_secret и MAIL_WEBHOOK_SECRET — одна строка, посимвольно (частая ошибка: ljk vs llk)
  5) Залить .htaccess (скрытый файл) — иначе mail-config.php могут прочитать по URL

Проверка с компьютера (подставьте секрет):
  curl -sS -X POST 'https://briket-berry.ru/mail/mail-order.php' \
    -H 'Content-Type: application/json' \
    -H 'X-Webhook-Secret: ВАШ_СЕКРЕТ' \
    -d '{"type":"test"}'

Ожидание: JSON {"ok":true,"recipients":[...]}  и письмо на ящики из recipients.

После правок в Railway: Deploy / Redeploy сервиса briket-berry.
В админке → Настройки → Email: зелёный блок «webhook включён» = переменные видит API.
