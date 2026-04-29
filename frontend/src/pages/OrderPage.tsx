import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check, CreditCard, FileText, Phone, Building2, User, MessageSquare, ChevronRight, ChevronLeft, ShoppingCart } from 'lucide-react'
import clsx from 'clsx'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

const orderSchema = z.object({
  paymentMethod: z.enum(['online', 'invoice']),
  name: z.string().min(2, 'Минимум 2 символа').max(50),
  phone: z.string().min(10, 'Введите номер телефона').max(20),
  email: z.string().email('Неверный email').optional().or(z.literal('')),
  establishment: z.string().min(2, 'Обязательное поле').max(100),
  establishmentType: z.enum(['RESTAURANT', 'CAFE', 'SHAWARMA', 'DELIVERY', 'OTHER']),
  city: z.string().min(2, 'Обязательное поле').max(50),
  comment: z.string().max(500).optional(),
  privacyConsent: z.literal(true, { errorMap: () => ({ message: 'Необходимо согласие' }) }),
  inn: z.string().optional(),
  organizationName: z.string().optional(),
  website: z.string().optional(), // honeypot
})

type FormData = z.infer<typeof orderSchema>

type Product = {
  id: string
  sku: string
  name: string
  price: number | string
  priceWholesale?: number | string | null
  wholesaleMinQty?: number
  weight?: number
}

function getOrderPricing(product: Product) {
  const regular = Number(product.price || 0)
  const sku = String(product.sku || '').toUpperCase()

  // Keep request-form pricing stable even if legacy DB values differ.
  if (sku === 'PFR-8') return { regular: 120, wholesale: 100, wholesaleMin: 50 }
  if (sku === 'PKB-10') return { regular: 890, wholesale: 835, wholesaleMin: 20 }

  const wholesale = product.priceWholesale != null ? Number(product.priceWholesale) : regular
  const wholesaleMin = Number(product.wholesaleMinQty || 1)
  return { regular, wholesale, wholesaleMin }
}

const steps = ['Товары', 'Оплата', 'Контакты']
const MAX_QTY = 9999
const INPUT_DEBOUNCE_MS = 180

const clampQty = (value: number) => {
  if (!Number.isFinite(value)) return 0
  return Math.min(MAX_QTY, Math.max(0, Math.floor(value)))
}

export default function OrderPage() {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      paymentMethod: 'online',
      establishmentType: 'RESTAURANT',
    },
  })

  const { data: productsData } = useQuery({
    queryKey: ['products-for-order'],
    queryFn: () => axios.get('/api/v1/products').then((r) => r.data.data),
  })

  const products: Product[] = Array.isArray(productsData) ? productsData : []
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [draftQuantities, setDraftQuantities] = useState<Record<string, string>>({})
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout> | undefined>>({})

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      Object.values(timers).forEach((timer) => {
        if (timer) clearTimeout(timer)
      })
    }
  }, [])

  const commitQuantityDebounced = (productId: string, qty: number) => {
    const oldTimer = timersRef.current[productId]
    if (oldTimer) clearTimeout(oldTimer)
    timersRef.current[productId] = setTimeout(() => {
      const normalized = clampQty(qty)
      setQuantities((prev) => ({ ...prev, [productId]: normalized }))
      setDraftQuantities((prev) => ({ ...prev, [productId]: String(normalized) }))
    }, INPUT_DEBOUNCE_MS)
  }

  const commitQuantityNow = (productId: string, qty: number) => {
    const normalized = clampQty(qty)
    const oldTimer = timersRef.current[productId]
    if (oldTimer) clearTimeout(oldTimer)
    setQuantities((prev) => ({ ...prev, [productId]: normalized }))
    setDraftQuantities((prev) => ({ ...prev, [productId]: String(normalized) }))
  }

  const calc = products.reduce(
    (acc, product) => {
      const qty = quantities[product.id] || 0
      if (!qty) return acc

      const { regular, wholesale, wholesaleMin } = getOrderPricing(product)
      const unitPrice = qty >= wholesaleMin ? wholesale : regular

      acc.subtotal += regular * qty
      acc.discount += (regular - unitPrice) * qty
      acc.total += unitPrice * qty
      return acc
    },
    { subtotal: 0, discount: 0, total: 0 }
  )

  const formValues = watch()
  const { discount, total } = calc
  const hasItems = total > 0

  const onSubmit = async (data: FormData) => {
    if (data.website) return // honeypot
    setIsSubmitting(true)
    try {
      const items = products
        .map((p) => ({ productId: p.id, sku: p.sku, quantity: quantities[p.id] || 0 }))
        .filter((i) => i.quantity > 0)

      // Backward-compatible payload for servers that still use legacy fields.
      const legacyPiniKayQty = products
        .filter((p) => String(p.sku).toUpperCase() === 'PKB-10')
        .reduce((sum, p) => sum + (quantities[p.id] || 0), 0)
      const legacyFirestartersQty = products
        .filter((p) => String(p.sku).toUpperCase() === 'PFR-8')
        .reduce((sum, p) => sum + (quantities[p.id] || 0), 0)

      const res = await axios.post('/api/v1/orders', {
        ...data,
        items,
        piniKay10kg: legacyPiniKayQty,
        firestarters8: legacyFirestartersQty,
      })
      if (data.paymentMethod === 'online' && res.data.data.paymentUrl) {
        window.location.href = res.data.data.paymentUrl
      } else {
        navigate('/order/success', { state: { orderNumber: res.data.data.orderNumber } })
      }
    } catch {
      alert('Ошибка при отправке. Пожалуйста, позвоните нам.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const goNext = () => {
    if (step === 0 && !hasItems) return
    setStep(s => Math.min(s + 1, 2))
  }
  const goPrev = () => setStep(s => Math.max(s - 1, 0))

  return (
    <>
      <Helmet>
        <title>Оставить заявку на угольные брикеты | Брикет-Бери</title>
        <meta name="description" content="Оформите заявку на угольные брикеты Pini Kay 10 кг и парафиновый розжиг 8 кубиков. Онлайн-оплата или счёт для юрлиц." />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://briket-berry.ru/order" />
        <meta property="og:title" content="Оставить заявку на брикеты Pini Kay" />
        <meta property="og:description" content="Заявка на оптовую поставку угольных брикетов и розжига по России." />
        <meta property="og:url" content="https://briket-berry.ru/order" />
      </Helmet>

      <div className="pt-28 pb-16 min-h-screen bg-[#0A0A0A]">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="fire-badge mb-4">📝 Заявка</div>
              <h1 className="section-title mb-4">
                Оформить <span className="gradient-text">заявку</span>
              </h1>
              <p className="section-subtitle">Заполните форму и мы свяжемся с вами в течение 30 минут</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-center mb-10">
              {steps.map((label, i) => (
                <div key={label} className="flex items-center">
                  <button
                    onClick={() => i < step && setStep(i)}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                      i === step ? 'bg-brand-orange text-white' :
                      i < step ? 'text-brand-orange bg-brand-orange/10 cursor-pointer' :
                      'text-white/30 bg-[#1A1A1A] cursor-not-allowed'
                    )}
                  >
                    <div className={clsx(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                      i < step ? 'bg-green-400 text-black' : i === step ? 'bg-white text-brand-orange' : 'bg-white/10 text-white/30'
                    )}>
                      {i < step ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    {label}
                  </button>
                  {i < steps.length - 1 && (
                    <div className={clsx('w-8 h-px mx-2', i < step ? 'bg-brand-orange' : 'bg-white/10')} />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Honeypot */}
              <input type="text" {...register('website')} style={{ display: 'none' }} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main form */}
                <div className="lg:col-span-2">
                  <AnimatePresence mode="wait">
                    {step === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="card p-8 space-y-6"
                      >
                        <h2 className="font-bold text-xl text-white flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5 text-brand-orange" />
                          Выберите продукты
                        </h2>

                        {products.map((item) => {
                          const qty = quantities[item.id] || 0
                          const draftRaw = draftQuantities[item.id]
                          const isOverLimit = typeof draftRaw === 'string' && draftRaw.length > 0 && Number(draftRaw) > MAX_QTY
                          const { regular, wholesale, wholesaleMin } = getOrderPricing(item)
                          const wholesaleLabel = `${wholesale.toLocaleString('ru')} ₽/шт от ${wholesaleMin}`
                          return (
                          <div key={item.id} className="flex items-center gap-4 p-4 bg-[#111111] rounded-xl border border-white/5">
                            <div className="flex-1">
                              <div className="text-white font-medium text-sm">{item.name}</div>
                              <div className="text-white/30 text-xs">{regular.toLocaleString('ru')} ₽/шт · Опт: {wholesaleLabel}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const current = quantities[item.id] || 0
                                  commitQuantityNow(item.id, current - 1)
                                }}
                                className="w-8 h-8 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors flex items-center justify-center text-lg font-bold"
                              >−</button>
                              <input
                                type="number"
                                min="0"
                                max={MAX_QTY}
                                value={draftQuantities[item.id] ?? String(qty)}
                                onChange={(e) => {
                                  const onlyDigits = e.target.value.replace(/[^\d]/g, '')
                                  setDraftQuantities((prev) => ({ ...prev, [item.id]: onlyDigits }))
                                  const next = clampQty(Number(onlyDigits || 0))
                                  commitQuantityDebounced(item.id, next)
                                }}
                                onBlur={() => {
                                  const raw = draftQuantities[item.id] ?? String(qty)
                                  commitQuantityNow(item.id, Number(raw || 0))
                                }}
                                onKeyDown={(e) => {
                                  if (e.key !== 'Enter') return
                                  e.preventDefault()
                                  const raw = draftQuantities[item.id] ?? String(qty)
                                  commitQuantityNow(item.id, Number(raw || 0))
                                }}
                                className={clsx(
                                  'w-16 text-center bg-transparent text-white font-semibold text-sm focus:outline-none border rounded-lg py-1.5 transition-colors',
                                  isOverLimit
                                    ? 'border-amber-400/80 shadow-[0_0_0_1px_rgba(251,191,36,0.25)]'
                                    : 'border-white/10'
                                )}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const current = quantities[item.id] || 0
                                  commitQuantityNow(item.id, current + 1)
                                }}
                                className="w-8 h-8 rounded-lg bg-white/5 text-white hover:bg-brand-orange/20 hover:text-brand-orange transition-colors flex items-center justify-center text-lg font-bold"
                              >+</button>
                            </div>
                            {isOverLimit && (
                              <p className="text-amber-300/90 text-[11px] leading-tight ml-2">
                                Максимум: {MAX_QTY}. Значение будет автоматически ограничено.
                              </p>
                            )}
                          </div>
                        )})}

                        <p className="text-white/35 text-xs -mt-2">
                          Количество для каждого товара: от 0 до {MAX_QTY}.
                        </p>

                        {!hasItems && (
                          <p className="text-red-400/80 text-sm text-center py-2">Выберите хотя бы один товар</p>
                        )}
                      </motion.div>
                    )}

                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="card p-8"
                      >
                        <h2 className="font-bold text-xl text-white flex items-center gap-2 mb-6">
                          <CreditCard className="w-5 h-5 text-brand-orange" />
                          Способ оплаты
                        </h2>

                        <Controller
                          name="paymentMethod"
                          control={control}
                          render={({ field }) => (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {[
                                {
                                  value: 'online',
                                  icon: CreditCard,
                                  title: 'Онлайн оплата',
                                  subtitle: 'Карта, СБП, QR-код',
                                  desc: 'Моментальная обработка заказа. Принимаем Visa, МИР, MasterCard, СБП.',
                                },
                                {
                                  value: 'invoice',
                                  icon: FileText,
                                  title: 'Счёт для юрлиц',
                                  subtitle: 'Для ООО и ИП',
                                  desc: 'Выставим счёт на вашу организацию с НДС или без. Оплата в течение 3 дней.',
                                },
                              ].map((opt) => {
                                const Icon = opt.icon
                                return (
                                  <label
                                    key={opt.value}
                                    className={clsx(
                                      'cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300',
                                      field.value === opt.value
                                        ? 'border-brand-orange bg-brand-orange/5 shadow-[0_0_20px_rgba(255,107,43,0.15)]'
                                        : 'border-white/10 bg-[#111111] hover:border-white/20'
                                    )}
                                  >
                                    <input
                                      type="radio"
                                      value={opt.value}
                                      checked={field.value === opt.value}
                                      onChange={() => field.onChange(opt.value)}
                                      className="sr-only"
                                    />
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className={clsx(
                                        'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                                        field.value === opt.value ? 'bg-brand-orange text-white' : 'bg-white/5 text-white/40'
                                      )}>
                                        <Icon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <div className="text-white font-semibold text-sm">{opt.title}</div>
                                        <div className="text-white/40 text-xs">{opt.subtitle}</div>
                                      </div>
                                    </div>
                                    <p className="text-white/50 text-xs leading-relaxed">{opt.desc}</p>
                                  </label>
                                )
                              })}
                            </div>
                          )}
                        />
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="card p-8 space-y-5"
                      >
                        <h2 className="font-bold text-xl text-white flex items-center gap-2">
                          <User className="w-5 h-5 text-brand-orange" />
                          Контактные данные
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-white/60 text-sm mb-1.5 block">Ваше имя *</label>
                            <input {...register('name')} placeholder="Иван Иванов" className="input-field" />
                            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                          </div>
                          <div>
                            <label className="text-white/60 text-sm mb-1.5 block flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-brand-orange" /> Телефон *
                            </label>
                            <input {...register('phone')} placeholder="+7 (900) 000-00-00" className="input-field" />
                            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="text-white/60 text-sm mb-1.5 block">Email (для копии)</label>
                          <input {...register('email')} placeholder="email@example.ru" type="email" className="input-field" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-white/60 text-sm mb-1.5 block flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-brand-orange" /> Название заведения *
                            </label>
                            <input {...register('establishment')} placeholder="Ресторан «Пример»" className="input-field" />
                            {errors.establishment && <p className="text-red-400 text-xs mt-1">{errors.establishment.message}</p>}
                          </div>
                          <div>
                            <label className="text-white/60 text-sm mb-1.5 block">Тип заведения *</label>
                            <select {...register('establishmentType')} className="input-field">
                              <option value="RESTAURANT">Ресторан</option>
                              <option value="CAFE">Кафе</option>
                              <option value="SHAWARMA">Шаурмичная</option>
                              <option value="DELIVERY">Доставка</option>
                              <option value="OTHER">Другое</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-white/60 text-sm mb-1.5 block">Город *</label>
                          <input {...register('city')} placeholder="Москва" className="input-field" />
                          {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
                        </div>

                        <div>
                          <label className="text-white/60 text-sm mb-1.5 block flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-brand-orange" /> Комментарий
                          </label>
                          <textarea
                            {...register('comment')}
                            rows={3}
                            placeholder="Дополнительные пожелания, вопросы..."
                            className="input-field resize-none"
                          />
                        </div>

                        {formValues.paymentMethod === 'invoice' && (
                          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-3">
                            <p className="text-blue-400 text-sm font-medium">Реквизиты организации (для счёта)</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-white/40 text-xs mb-1 block">ИНН</label>
                                <input {...register('inn')} placeholder="1234567890" className="input-field text-sm py-2" />
                              </div>
                              <div>
                                <label className="text-white/40 text-xs mb-1 block">Название организации</label>
                                <input {...register('organizationName')} placeholder='ООО "Пример"' className="input-field text-sm py-2" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Privacy consent */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            {...register('privacyConsent')}
                            className="w-4 h-4 mt-0.5 rounded border-white/20 bg-[#1A1A1A] text-brand-orange focus:ring-brand-orange/30 flex-shrink-0"
                          />
                          <span className="text-white/40 text-xs leading-relaxed group-hover:text-white/60 transition-colors">
                            Я соглашаюсь с{' '}
                            <a href="/privacy" className="text-brand-orange hover:underline">политикой конфиденциальности</a>{' '}
                            и даю согласие на обработку персональных данных
                          </span>
                        </label>
                        {errors.privacyConsent && (
                          <p className="text-red-400 text-xs">{errors.privacyConsent.message}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="flex justify-between mt-6">
                    {step > 0 ? (
                      <button type="button" onClick={goPrev} className="btn-secondary py-3 px-6">
                        <ChevronLeft className="w-4 h-4" />
                        Назад
                      </button>
                    ) : <div />}

                    {step < 2 ? (
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={step === 0 && !hasItems}
                        className={clsx('btn-primary py-3 px-6', step === 0 && !hasItems && 'opacity-50 cursor-not-allowed')}
                      >
                        Далее
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary py-3 px-8 min-w-[180px]"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Отправка...
                          </span>
                        ) : (
                          <>
                            {formValues.paymentMethod === 'online' ? 'Перейти к оплате' : 'Отправить заявку'}
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="card p-6 sticky top-24">
                    <h3 className="font-semibold text-white mb-4">Ваш заказ</h3>

                    {products.map((item) => {
                      const qty = quantities[item.id] || 0
                      if (!qty) return null
                      const { regular, wholesale, wholesaleMin } = getOrderPricing(item)
                      const unitPrice = qty >= wholesaleMin ? wholesale : regular
                      return (
                        <div key={item.id} className="flex justify-between py-2 border-b border-white/5 text-sm">
                          <div>
                            <div className="text-white">{item.name}</div>
                            <div className="text-white/30 text-xs">{qty} шт × {unitPrice} ₽</div>
                          </div>
                          <div className="text-white font-medium">{(qty * unitPrice).toLocaleString('ru')} ₽</div>
                        </div>
                      )
                    })}

                    {!hasItems && (
                      <div className="text-white/30 text-sm text-center py-4">Товары не выбраны</div>
                    )}

                    {discount > 0 && (
                      <div className="flex justify-between py-2 text-sm text-green-400">
                        <span>Скидка (опт)</span>
                        <span>-{discount.toLocaleString('ru')} ₽</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-3 mt-2 border-t border-white/10">
                      <span className="font-bold text-white">Итого</span>
                      <span className="font-display font-bold text-xl gradient-text">{total.toLocaleString('ru')} ₽</span>
                    </div>

                    <p className="text-white/30 text-xs mt-4 leading-relaxed">
                      Стоимость доставки рассчитывается отдельно. Менеджер уточнит при звонке.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
