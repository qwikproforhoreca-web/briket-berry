import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Check, ArrowRight, Calculator, Minus, Plus } from 'lucide-react'
import clsx from 'clsx'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

type Category = 'all' | 'briquettes' | 'firestarters'

type ApiCategory = 'BRIQUETTES' | 'FIRESTARTERS'

type CatalogCategory = 'briquettes' | 'firestarters'

/** Короткий список на карточке — не из БД, чтобы не дублировались строки из характеристик. */
const catalogCardFeatureLines: Record<CatalogCategory, readonly string[]> = {
  briquettes: ['До 8 часов горения', '900°C температура', 'Без дыма и запаха'],
  firestarters: ['Розжиг за 5–7 минут', 'Без жидкости — натуральный парафин', 'Без дыма и запаха'],
}

type CatalogSpecs = Record<string, string>

type CatalogProduct = {
  id: string
  category: CatalogCategory
  name: string
  variant: string
  price: number
  priceWholesale: number
  wholesaleMin: number
  sku: string
  badge: string
  badgeClass: string
  image: string
  description: string
  features: string[]
  specs: CatalogSpecs
}

const categories = [
  { id: 'all', label: 'Все продукты' },
  { id: 'briquettes', label: '🔥 Угольные брикеты' },
  { id: 'firestarters', label: '🌿 Розжиг' },
]

function clampInt(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function ruBoxesWord(n: number): string {
  const n100 = Math.abs(n) % 100
  if (n100 > 10 && n100 < 15) return 'ящиков'
  const n10 = n % 10
  if (n10 === 1) return 'ящик'
  if (n10 >= 2 && n10 <= 4) return 'ящика'
  return 'ящиков'
}

type CalcFieldProps = {
  id: string
  label: string
  hint?: string
  value: number
  onChange: (n: number) => void
  min: number
  max: number
}

/**
 * Отдельный контрол: строка в фокусе (можно стереть и набрать заново),
 * число в родителе — без Number('') === 0 при пустом поле.
 */
function CalcField({ id, label, hint, value, onChange, min, max }: CalcFieldProps) {
  const [text, setText] = useState(String(value))
  const focused = useRef(false)

  useEffect(() => {
    // Sync controlled input after parent value updates (lint rule disabled for this controlled-field pattern).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!focused.current) setText(String(value))
  }, [value])

  const commit = (raw: string) => {
    if (raw === '') {
      onChange(value)
      setText(String(value))
      return
    }
    const n = parseInt(raw, 10)
    if (Number.isNaN(n)) {
      setText(String(value))
      return
    }
    const c = clampInt(n, min, max)
    onChange(c)
    setText(String(c))
  }

  const bump = (delta: number) => {
    const c = clampInt(value + delta, min, max)
    onChange(c)
    setText(String(c))
  }

  return (
    <div className="space-y-2 h-full">
      <div className="flex flex-col gap-0.5 min-h-[56px]">
        <label htmlFor={id} className="text-white/80 text-sm font-medium tracking-tight">
          {label}
        </label>
        {hint ? <p className="text-white/35 text-xs leading-snug">{hint}</p> : null}
      </div>
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          aria-label={`Уменьшить ${label}`}
          disabled={value <= min}
          onClick={() => bump(-1)}
          className="shrink-0 w-11 min-h-[48px] rounded-xl border border-white/10 bg-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.1] hover:border-brand-orange/30 active:scale-[0.98] transition flex items-center justify-center disabled:opacity-35 disabled:pointer-events-none"
        >
          <Minus className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={text}
          onFocus={() => {
            focused.current = true
          }}
          onBlur={() => {
            focused.current = false
            commit(text.trim())
          }}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, '')
            setText(next)
            if (next === '') return
            const n = parseInt(next, 10)
            if (!Number.isNaN(n)) onChange(clampInt(n, min, max))
          }}
          className="input-field min-h-[48px] text-center text-lg font-semibold tabular-nums tracking-tight flex-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label={`Увеличить ${label}`}
          disabled={value >= max}
          onClick={() => bump(1)}
          className="shrink-0 w-11 min-h-[48px] rounded-xl border border-white/10 bg-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.1] hover:border-brand-orange/30 active:scale-[0.98] transition flex items-center justify-center disabled:opacity-35 disabled:pointer-events-none"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
      <p className="text-white/25 text-[11px] min-h-[14px]">
        Диапазон: {min}–{max}
      </p>
    </div>
  )
}

function ConsumptionCalculator() {
  const [workers, setWorkers] = useState(1)
  const [hours, setHours] = useState(12)
  const [days, setDays] = useState(25)

  const kgPerDay = workers * 10 * (hours / 12)
  const kgPerMonth = kgPerDay * days
  const boxesMonth = Math.max(1, Math.ceil(kgPerMonth / 10))

  return (
    <section
      className="relative z-10 mt-12 sm:mt-16 max-w-4xl mx-auto rounded-2xl border border-brand-orange/25 bg-gradient-to-b from-[#141414] to-[#0D0D0D] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_48px_rgba(0,0,0,0.45)] overflow-hidden"
      aria-labelledby="consumption-calculator-heading"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-orange/40 to-transparent" />
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className="w-12 h-12 shrink-0 bg-brand-orange/15 rounded-2xl flex items-center justify-center ring-1 ring-brand-orange/20">
            <Calculator className="w-6 h-6 text-brand-orange" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3
              id="consumption-calculator-heading"
              className="font-display font-bold text-white text-xl sm:text-2xl tracking-tight"
            >
              Калькулятор расхода
            </h3>
            <p className="text-white/45 text-sm sm:text-base mt-1.5 leading-relaxed max-w-xl">
              Оценка по рабочей модели: 1 коробка (10 кг) на 1 хоспер/мангал за 12 часовую смену.
              Подберите параметры — ниже появится ориентир по закупке.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
          <CalcField
            id="calc-workers"
            label="Хосперов / мангалов"
            hint="Количество точек, где одновременно жарят на угле"
            value={workers}
            onChange={setWorkers}
            min={1}
            max={10}
          />
          <CalcField
            id="calc-hours"
            label="Рабочих часов в день"
            hint="Средняя длительность смены с горящим углём"
            value={hours}
            onChange={setHours}
            min={8}
            max={16}
          />
          <CalcField
            id="calc-days"
            label="Рабочих дней в месяц"
            hint="Без выходных и простоев печи"
            value={days}
            onChange={setDays}
            min={15}
            max={31}
          />
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-4">Ориентировочный расход</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'В день', sub: 'брикетов Pini Kay', value: `${kgPerDay.toFixed(1)} кг` },
            { label: 'В месяц', sub: 'суммарно', value: `${Math.ceil(kgPerMonth)} кг` },
            { label: 'Ящиков', sub: 'по 10 кг', value: String(boxesMonth) },
          ].map((row) => (
            <div
              key={row.label}
              className="group relative rounded-xl border border-white/[0.08] bg-[#0A0A0A]/90 px-4 py-4 sm:py-5 text-center sm:text-left ring-0 transition hover:border-brand-orange/25 hover:bg-[#0C0C0C]"
            >
              <div className="flex sm:flex-col items-center justify-between sm:items-stretch gap-3 sm:gap-1">
                <div className="text-left min-w-0">
                  <div className="text-white/50 text-xs font-medium">{row.label}</div>
                  <div className="text-white/30 text-[11px] mt-0.5 hidden sm:block">{row.sub}</div>
                </div>
                <div className="font-display font-bold text-2xl sm:text-3xl text-brand-orange tabular-nums shrink-0">
                  {row.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
          <Link
            to="/order"
            className="btn-primary w-full sm:w-auto justify-center min-h-[52px] text-base px-8 shadow-lg shadow-brand-orange/10"
          >
            Оформить заявку на {boxesMonth} {ruBoxesWord(boxesMonth)}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-white/30 text-xs text-center sm:text-left max-w-xs sm:max-w-[220px]">
            Точный расчёт и опт — после звонка менеджера.
          </p>
        </div>
      </div>
    </section>
  )
}

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
  const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || ''
  const resolveImageUrl = useCallback((url?: string) => {
    if (!url) return '/favicon.svg'
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
    if (url.startsWith('/uploads/') && API_BASE) return `${API_BASE}${url}`
    return url
  }, [API_BASE])

  const { data } = useQuery({
    queryKey: ['products-public'],
    queryFn: () => axios.get('/api/v1/products', { withCredentials: true }).then((r) => r.data.data),
  })

  const products: CatalogProduct[] = useMemo(() => {
    const list = Array.isArray(data) ? (data as Record<string, unknown>[]) : []

    return list.map((p) => {
      const apiCategory = String(p.category) as ApiCategory
      const category: CatalogCategory = apiCategory === 'BRIQUETTES' ? 'briquettes' : 'firestarters'

      const weightNum = Number(p.weight ?? 0)
      const weightStr = Number.isFinite(weightNum) ? (Number.isInteger(weightNum) ? String(weightNum) : String(weightNum)) : '—'
      const variant = category === 'briquettes' ? `${weightStr} кг` : `${weightStr} кубиков`

      const specsObj = p.specs && typeof p.specs === 'object' ? p.specs : {}
      const specs: CatalogSpecs = Object.fromEntries(
        Object.entries(specsObj).map(([k, v]) => [k, String(v)])
      )

      const price = Number(p.price ?? 0)
      const priceWholesale = p.priceWholesale !== null && typeof p.priceWholesale !== 'undefined' ? Number(p.priceWholesale) : 0

      const image = resolveImageUrl(Array.isArray(p.images) && p.images[0] ? String(p.images[0]) : '')

      const badge =
        category === 'briquettes'
          ? p.featured ? '🔥 Хит продаж' : '🔥 Брикеты'
          : p.featured ? '🌿 Экологичный' : '🌿 Розжиг'

      const badgeClass =
        category === 'briquettes'
          ? 'bg-brand-orange/20 text-brand-orange border-brand-orange/30'
          : 'bg-green-500/20 text-green-400 border-green-500/30'

      return {
        id: String(p.id),
        category,
        name: String(p.name ?? ''),
        variant,
        price,
        priceWholesale,
        wholesaleMin: Number(p.wholesaleMin ?? 1),
        sku: String(p.sku ?? ''),
        badge,
        badgeClass,
        image,
        description: String(p.description ?? ''),
        features: [...catalogCardFeatureLines[category]],
        specs,
      }
    })
  }, [data, resolveImageUrl])

  const filtered = products.filter((p) => activeCategory === 'all' || p.category === activeCategory)

  return (
    <>
      <Helmet>
        <title>Купить угольные брикеты Pini Kay оптом | Брикет-Бери</title>
        <meta
          name="description"
          content="Угольные брикеты Pini Kay для ресторанов и кафе. 10 кг — 890 ₽. Опт 835 ₽/шт от 20 шт. Парафиновый розжиг 8 кубиков — 120 ₽, опт 100 ₽/шт от 50 шт."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://briket-berry.ru/products" />
        <meta property="og:title" content="Каталог Pini Kay: брикеты и розжиг оптом" />
        <meta property="og:description" content="Каталог угольных брикетов и розжига Pini Kay для мангалов и хосперов." />
        <meta property="og:url" content="https://briket-berry.ru/products" />
        <meta property="og:type" content="product.group" />
      </Helmet>

      {/* Hero */}
      <div className="pt-28 pb-16 bg-[#0A0A0A] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,107,43,0.08),transparent_60%)] pointer-events-none" />
        <div className="container-custom">
          <div className="fire-badge mb-4">📦 Каталог</div>
          <h1 className="section-title mb-4">
            Угольные брикеты и{' '}
            <span className="gradient-text">розжиг</span>
          </h1>
          <p className="section-subtitle max-w-2xl">
            Профессиональный уголь Pini Kay и парафиновый розжиг для ресторанов, кафе и хосперов. Оптовые цены при заказе от 10 ящиков.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[64px] z-30 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5 py-4">
        <div className="container-custom">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as Category)}
                className={clsx(
                  'px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                  activeCategory === cat.id
                    ? 'bg-brand-orange text-white'
                    : 'bg-[#1A1A1A] text-white/60 hover:text-white hover:bg-[#222222]'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="section-padding bg-[#0A0A0A]">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card overflow-hidden group hover:border-brand-orange/20 transition-all duration-500 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-56 bg-[#111111] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement
                      t.src = '/favicon.svg'
                    }}
                  />
                  <div className={`absolute top-3 left-3 px-2.5 py-1 border rounded-full text-xs font-medium ${product.badgeClass}`}>
                    {product.badge}
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-lg text-white/60 text-xs">
                    SKU: {product.sku}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="font-display font-bold text-xl text-white">{product.name}</h2>
                  <div className="text-brand-orange text-sm font-medium mb-3">{product.variant}</div>
                  <p className="text-white/50 text-sm leading-relaxed mb-5">{product.description}</p>

                  {/* Features */}
                  <ul className="grid grid-cols-1 gap-1.5 mb-5">
                    {product.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-white/60 text-sm">
                        <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Specs toggle */}
                  <button
                    onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                    className="text-brand-orange/70 hover:text-brand-orange text-xs transition-colors mb-4 flex items-center gap-1"
                  >
                    {expandedProduct === product.id ? '▲' : '▼'} Технические характеристики
                  </button>

                  {expandedProduct === product.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-5 bg-[#111111] rounded-xl p-4 overflow-hidden"
                    >
                      {Object.entries(product.specs).map(([key, val]) => (
                        <div key={key} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                          <span className="text-white/40 text-xs">{key}</span>
                          <span className="text-white/70 text-xs font-medium">{val}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Price + CTA */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pt-4 border-t border-white/5">
                    <div className="min-w-0">
                      <div className="font-display font-bold text-2xl text-white">{product.price} ₽</div>
                      <div className="text-white/30 text-xs mt-0.5">
                        {product.category === 'briquettes'
                          ? 'Опт: 835 ₽/шт от 20 шт'
                          : 'Опт: 100 ₽/шт от 50 шт'}
                      </div>
                    </div>
                    <Link
                      to="/order"
                      className="btn-primary py-3 px-5 text-sm w-full sm:w-auto justify-center shrink-0 min-h-[44px]"
                    >
                      Заказать
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Calculator */}
          <ConsumptionCalculator />
        </div>
      </div>
    </>
  )
}
