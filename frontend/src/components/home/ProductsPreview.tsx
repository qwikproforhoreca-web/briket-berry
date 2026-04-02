import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Clock, Thermometer, Package } from 'lucide-react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

type ApiProductCategory = 'BRIQUETTES' | 'FIRESTARTERS'
type CatalogCategory = 'briquettes' | 'firestarters'

type ApiProduct = {
  id: string
  name: string
  category: ApiProductCategory
  price: number
  priceWholesale?: number | null
  wholesaleMin?: number | null
  weight?: number | null
  sku?: string
  description?: string
  images?: string[]
  specs?: Record<string, unknown>
  featured?: boolean
  sortOrder?: number | null
  createdAt?: string
  inStock?: boolean
}

function toNum(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function formatWeight(value: unknown) {
  const n = toNum(value)
  if (typeof n !== 'number') return '—'
  return Number.isInteger(n) ? String(n) : String(n)
}

function pickTopProduct(list: ApiProduct[], desiredCategory: ApiProductCategory): ApiProduct | undefined {
  const items = list.filter((p) => p.category === desiredCategory)
  if (!items.length) return undefined

  // Sort: featured first, then sortOrder asc, then createdAt desc.
  return items
    .slice()
    .sort((a, b) => {
      const feat = Number(Boolean(b.featured)) - Number(Boolean(a.featured))
      if (feat !== 0) return feat
      const so = Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)
      if (so !== 0) return so
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })
    .find((p) => p.inStock !== false) ?? items[0]
}

function getSpecsValue(specs: ApiProduct['specs'] | undefined, key: string, fallback: string) {
  if (!specs) return fallback
  const v = specs[key]
  if (v === null || typeof v === 'undefined') return fallback
  const s = String(v).trim()
  return s ? s : fallback
}

export default function ProductsPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
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
    staleTime: 5 * 60 * 1000,
  })

  const cards = useMemo(() => {
    const list: ApiProduct[] = Array.isArray(data) ? (data as ApiProduct[]) : []

    const briquettes = pickTopProduct(list, 'BRIQUETTES')
    const firestarters = pickTopProduct(list, 'FIRESTARTERS')

    const makeCard = (p: ApiProduct, category: CatalogCategory) => {
      const specs = p.specs
      const image = resolveImageUrl(Array.isArray(p.images) && p.images[0] ? String(p.images[0]) : '')

      const badge =
        category === 'briquettes'
          ? p.featured ? '🔥 Хит продаж' : '🔥 Брикеты'
          : p.featured ? '✨ Экологичный' : '🌿 Розжиг'

      const badgeColor =
        category === 'briquettes'
          ? 'bg-brand-orange/20 text-brand-orange border-brand-orange/30'
          : 'bg-green-500/20 text-green-400 border-green-500/30'

      const subtitle = category === 'briquettes'
        ? `${formatWeight(p.weight)} кг — 1 ящик`
        : `${formatWeight(p.weight)} кубиков в упаковке`

      const priceText = `от ${Math.round(Number(p.price ?? 0))} ₽`
      const priceWholesale =
        typeof p.priceWholesale === 'number'
          ? category === 'briquettes'
            ? `опт от ${Math.round(Number(p.priceWholesale))} ₽/кг`
            : `опт от ${Math.round(Number(p.priceWholesale))} ₽`
          : 'опт по запросу'

      const iconList = [Clock, Thermometer, Package]
      const specEntries = Object.entries(specs || {})
        .filter(([, v]) => v != null && String(v).trim() !== '')
        .slice(0, 3)

      const fallbackFeatures =
        category === 'briquettes'
          ? [
              { icon: Clock, text: 'До 8 часов горения' },
              { icon: Thermometer, text: '900°C температура' },
              { icon: Package, text: 'Без дыма и запаха' },
            ]
          : [
              { icon: Clock, text: '10 минут горения' },
              { icon: Thermometer, text: 'Без химии' },
              { icon: Package, text: 'Розжиг за 5-7 минут' },
            ]

      const features =
        specEntries.length > 0
          ? specEntries.map(([, v], i) => ({
              icon: iconList[i % iconList.length],
              text: String(v).trim(),
            }))
          : fallbackFeatures

      const gradient = category === 'briquettes' ? 'from-brand-orange/20 to-transparent' : 'from-green-500/10 to-transparent'

      return {
        id: p.id,
        kind: category,
        name: p.name,
        subtitle,
        price: priceText,
        priceWholesale,
        image,
        badge,
        badgeColor,
        features,
        href: '/products',
        gradient,
      }
    }

    const result: any[] = []
    if (briquettes) result.push(makeCard(briquettes, 'briquettes'))
    if (firestarters) result.push(makeCard(firestarters, 'firestarters'))

    // Если API пока не вернул данные (или в БД пусто), показываем 2 “заглушки”
    if (!result.length) {
      return [
        {
          id: 'placeholder-briquettes',
          kind: 'briquettes',
          name: 'Pini Kay Брикеты',
          subtitle: '10 кг — 1 ящик',
          price: 'от 890 ₽',
          priceWholesale: 'опт от 750 ₽/кг',
          image: '/favicon.svg',
          badge: '🔥 Хит продаж',
          badgeColor: 'bg-brand-orange/20 text-brand-orange border-brand-orange/30',
          features: [
            { icon: Clock, text: 'До 8 часов горения' },
            { icon: Thermometer, text: '900°C температура' },
            { icon: Package, text: 'Без дыма и золы' },
          ],
          href: '/products',
          gradient: 'from-brand-orange/20 to-transparent',
        },
        {
          id: 'placeholder-firestarters',
          kind: 'firestarters',
          name: 'Парафиновый розжиг',
          subtitle: '8 кубиков в упаковке',
          price: 'от 120 ₽',
          priceWholesale: 'опт: скидка 30%',
          image: '/favicon.svg',
          badge: '✨ Экологичный',
          badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
          features: [
            { icon: Clock, text: '10 минут горения' },
            { icon: Thermometer, text: 'Без химии' },
            { icon: Package, text: 'Розжиг за 5 минут' },
          ],
          href: '/products',
          gradient: 'from-green-500/10 to-transparent',
        },
      ]
    }

    // Если по какой-то причине не хватает одной категории — подставим заглушку, чтобы оставались 2 карточки.
    if (result.length === 1) {
      const only = result[0]
      if (only.kind === 'briquettes') {
        return [
          only,
          {
            id: 'placeholder-firestarters',
            kind: 'firestarters',
            name: 'Парафиновый розжиг',
            subtitle: '8 кубиков в упаковке',
            price: 'от 120 ₽',
            priceWholesale: 'опт: скидка 30%',
            image: '/favicon.svg',
            badge: '✨ Экологичный',
            badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
            features: [
              { icon: Clock, text: '10 минут горения' },
              { icon: Thermometer, text: 'Без химии' },
              { icon: Package, text: 'Розжиг за 5 минут' },
            ],
            href: '/products',
            gradient: 'from-green-500/10 to-transparent',
          },
        ]
      }

      return [
        {
          id: 'placeholder-briquettes',
          kind: 'briquettes',
          name: 'Pini Kay Брикеты',
          subtitle: '10 кг — 1 ящик',
          price: 'от 890 ₽',
          priceWholesale: 'опт от 750 ₽/кг',
          image: '/favicon.svg',
          badge: '🔥 Хит продаж',
          badgeColor: 'bg-brand-orange/20 text-brand-orange border-brand-orange/30',
          features: [
            { icon: Clock, text: 'До 8 часов горения' },
            { icon: Thermometer, text: '900°C температура' },
            { icon: Package, text: 'Без дыма и золы' },
          ],
          href: '/products',
          gradient: 'from-brand-orange/20 to-transparent',
        },
        only,
      ]
    }

    return result
  }, [data])

  return (
    <section className="section-padding bg-[#111111]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="fire-badge mb-4">📦 Продукты</div>
          <h2 className="section-title mb-4">
            Наш <span className="gradient-text">ассортимент</span>
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Только проверенные продукты для профессиональной кухни
          </p>
        </div>

        {/* Products Grid */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {cards.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="card overflow-hidden group hover:border-brand-orange/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(255,107,43,0.1)]"
            >
              {/* Image area */}
              <div className="relative h-48 bg-[#111111] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/favicon.svg'
                  }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${product.gradient}`} />
                <div className={`absolute top-3 left-3 px-2.5 py-1 border rounded-full text-xs font-medium ${product.badgeColor}`}>
                  {product.badge}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-display font-bold text-xl text-white mb-1">{product.name}</h3>
                <p className="text-white/40 text-sm mb-4">{product.subtitle}</p>

                {/* Features */}
                <ul className="space-y-2 mb-5">
                  {product.features.map((feature) => {
                    const Icon = feature.icon
                    return (
                      <li key={feature.text} className="flex items-center gap-2 text-white/60 text-sm">
                        <Icon className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
                        {feature.text}
                      </li>
                    )
                  })}
                </ul>

                {/* Price + CTA */}
                <div className="flex items-end justify-between pt-4 border-t border-white/5">
                  <div>
                    <div className="font-display font-bold text-2xl text-white">{product.price}</div>
                    <div className="text-white/30 text-xs">{product.priceWholesale}</div>
                  </div>
                  <Link
                    to={product.href}
                    className="btn-primary py-2.5 px-5 text-sm"
                  >
                    Подробнее
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA to all products */}
        <div className="text-center mt-10">
          <Link to="/products" className="btn-secondary">
            Все продукты и цены
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
