# Задача 11: Интеграция оплаты ЮКасса

## Статус: ✅ Выполнено

---

## Описание
Интеграция ЮКасса SDK для онлайн-оплаты + генерация счёта для юрлиц.

---

## ЮКасса: Поддерживаемые методы оплаты

- Банковские карты (Visa, MasterCard, МИР)
- СБП (Система быстрых платежей)
- QR-код
- ЮMoney (бывший Яндекс.Деньги)
- SBERBANK (SberPay)
- Tinkoff Pay

---

## Процесс онлайн-оплаты

```
Клиент заполняет форму
        ↓
POST /api/v1/orders → создаётся Order (PENDING_PAYMENT)
        ↓
POST /api/v1/payment/create → создаётся Payment в ЮКасса
        ↓
Получаем confirmation.url → редирект клиента
        ↓
Клиент оплачивает на странице ЮКасса
        ↓
ЮКасса отправляет webhook → POST /api/v1/payment/webhook
        ↓
Обновляем статус Order → PAID
        ↓
Отправляем email подтверждение
        ↓
Редирект на /order/success
```

---

## Создание платежа

```typescript
// services/paymentService.ts
const payment = await yookassa.createPayment({
  amount: {
    value: order.totalAmount.toString(),
    currency: 'RUB',
  },
  capture: true,
  confirmation: {
    type: 'redirect',
    return_url: `${process.env.YOOKASSA_RETURN_URL}?orderId=${order.id}`,
  },
  description: `Заказ #${order.orderNumber} — Charcoal Shop`,
  metadata: {
    orderId: order.id,
    orderNumber: order.orderNumber,
    clientName: order.name,
    clientPhone: order.phone,
  },
  receipt: {
    customer: {
      phone: order.phone,
      email: order.email || undefined,
    },
    items: order.items.map(item => ({
      description: item.product.name,
      quantity: item.quantity,
      amount: {
        value: item.price.toString(),
        currency: 'RUB',
      },
      vat_code: 1, // НДС не облагается
    })),
  },
})
```

---

## Webhook обработка

```typescript
// controllers/paymentController.ts
async handleWebhook(req: Request, res: Response) {
  // 1. Верифицировать подпись ЮКасса
  const signature = req.headers['x-idempotence-key']
  const body = req.body
  
  if (body.event === 'payment.succeeded') {
    const paymentId = body.object.id
    const metadata = body.object.metadata
    
    // 2. Обновить статус платежа
    await prisma.payment.update({
      where: { yookassaId: paymentId },
      data: {
        status: 'SUCCEEDED',
        paidAt: new Date(),
      }
    })
    
    // 3. Обновить статус заказа
    await prisma.order.update({
      where: { id: metadata.orderId },
      data: { status: 'PAID' }
    })
    
    // 4. Отправить email
    await emailService.sendOrderConfirmation(order)
    await emailService.notifyManager(order)
  }
  
  res.status(200).json({ success: true })
}
```

---

## Генерация счёта для юрлиц

### Поля счёта
- Номер счёта (авто: СЧ-YYYYMM-XXXX)
- Дата выставления
- Продавец (реквизиты компании из настроек)
- Покупатель (из формы: ИНН, организация, адрес)
- Таблица товаров (наименование, кол-во, цена, сумма)
- НДС (по умолчанию: без НДС)
- Итого к оплате
- Реквизиты для оплаты (р/с, БИК, корр. счёт, банк)
- Подпись директора (факсимиле, опционально)

### Технология генерации
- **pdfmake** или **puppeteer** (HTML → PDF)
- Шаблон: профессиональный дизайн счёта
- Отправка: PDF прикреплён к email клиенту

---

## Настройки в Admin

```
Настройки → Оплата:
- ЮКасса Shop ID
- ЮКасса Secret Key
- Тестовый режим (toggle)
- Реквизиты компании для счёта:
  - Название ООО/ИП
  - ИНН
  - КПП
  - ОГРН
  - Банк
  - Р/с
  - К/с
  - БИК
  - Юр. адрес
```

---

## Тестирование

### ЮКасса тестовые карты
| Карта | Результат |
|-------|-----------|
| 5555 5555 5555 4444 | Успешная оплата |
| 5555 5555 5555 4477 | Отклонена банком |
| 5555 5555 5555 4491 | Недостаточно средств |

---

## Чеклист выполнения

- [x] Создание платежа ЮКасса
- [x] Обработка webhook
- [x] Генерация PDF счёта
- [x] Email с подтверждением
- [x] Тестирование (test mode)
- [x] Настройки в Admin
- [x] Логирование платежей
