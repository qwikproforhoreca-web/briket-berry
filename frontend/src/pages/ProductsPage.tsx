import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Check, ArrowRight, Calculator } from 'lucide-react'
import clsx from 'clsx'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

type Category = 'all' | 'briquettes' | 'firestarters'

type ApiCategory = 'BRIQUETTES' | 'FIRESTARTERS'

type CatalogCategory = 'briquettes' | 'firestarters'

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

function ConsumptionCalculator() {
  const [workers, setWorkers] = useState(1)
  const [hours, setHours] = useState(8)
  const [days, setDays] = useState(25)

  const kgPerDay = workers * 1.5 * (hours / 6)
  const kgPerMonth = kgPerDay * days
  const boxesMonth = Math.ceil(kgPerMonth / 10)

  return (
    <div className="card p-8 mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-orange/15 rounded-xl flex items-center justify-center">
          <Calculator className="w-5 h-5 text-brand-orange" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">Калькулятор расхода</h3>
          <p className="text-white/40 text-sm">Рассчитайте объём для вашего заведения</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Хосперов / мангалов', value: workers, onChange: setWorkers, min: 1, max: 10 },
          { label: 'Рабочих часов в день', value: hours, onChange: setHours, min: 4, max: 16 },
          { label: 'Рабочих дней в месяц', value: days, onChange: setDays, min: 15, max: 31 },
        ].map((field) => (
          <div key={field.label}>
            <label className="text-white/60 text-sm mb-2 block">{field.label}</label>
            <input
              type="number"
              value={field.value}
              onChange={(e) => field.onChange(Number(e.target.value))}
              min={field.min}
              max={field.max}
              className="input-field"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'кг в день', value: kgPerDay.toFixed(1) },
          { label: 'кг в месяц', value: Math.ceil(kgPerMonth) },
          { label: 'ящиков (10 кг)', value: boxesMonth },
        ].map((result) => (
          <div key={result.label} className="bg-[#111111] rounded-xl p-4 text-center border border-white/5">
            <div className="font-display font-bold text-3xl gradient-text">{result.value}</div>
            <div className="text-white/40 text-xs mt-1">{result.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link to="/order" className="btn-primary">
          Оформить заявку на {boxesMonth} ящиков
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
  const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || ''
  const resolveImageUrl = (url?: string) => {
    if (!url) return '/favicon.svg'
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
    if (url.startsWith('/uploads/') && API_BASE) return `${API_BASE}${url}`
    return url
  }

  const { data } = useQuery({
    queryKey: ['products-public'],
    queryFn: () => axios.get('/api/v1/products', { withCredentials: true }).then((r) => r.data.data),
  })

  const products: CatalogProduct[] = useMemo(() => {
    const list = Array.isArray(data) ? (data as any[]) : []

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

      const features = Object.values(specs).slice(0, 5)

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
        features,
        specs,
      }
    })
  }, [data])

  const filtered = products.filter((p) => activeCategory === 'all' || p.category === activeCategory)

  return (
    <>
      <Helmet>
        <title>Купить угольные брикеты Pini Kay оптом | Брикет-Бери</title>
        <meta
          name="description"
          content="Угольные брикеты Pini Kay для ресторанов и кафе. 10 кг от 750 ₽. Парафиновый розжиг 8 кубиков — 120 ₽. Оптовые цены. Работаем 10:00–18:00"
        />
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
                  <div className="flex items-end justify-between pt-4 border-t border-white/5">
                    <div>
                      <div className="font-display font-bold text-2xl text-white">{product.price} ₽</div>
                      <div className="text-white/30 text-xs">
                        Опт от {product.wholesaleMin} шт: {product.priceWholesale} ₽
                      </div>
                    </div>
                    <Link to="/order" className="btn-primary py-2.5 px-5 text-sm">
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
