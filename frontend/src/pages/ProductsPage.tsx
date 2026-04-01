import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Check, ArrowRight, Calculator } from 'lucide-react'
import clsx from 'clsx'

type Category = 'all' | 'briquettes' | 'firestarters'

const products = [
  {
    id: 'pini-kay-10',
    category: 'briquettes',
    name: 'Угольные брикеты Pini Kay',
    variant: '10 кг',
    price: 890,
    priceWholesale: 750,
    wholesaleMin: 20,
    sku: 'PKB-10',
    badge: '🔥 Хит продаж',
    badgeClass: 'bg-brand-orange/20 text-brand-orange border-brand-orange/30',
    image: '/images/pini-kay-10.jpg',
    description: 'Профессиональные угольные брикеты для хосперов, мангалов и гриль-печей. Берёзовая древесина без химических добавок.',
    features: ['До 8 часов горения', '900°C рабочая температура', 'Без дыма и запаха', 'Зольность < 3%', 'Экологически чистый'],
    specs: {
      'Вес': '10 кг',
      'Форма': 'Шестигранник Pini Kay',
      'Время горения': 'До 8 часов',
      'Температура': '900°C+',
      'Зольность': '< 3%',
      'Влажность': '< 5%',
      'Применение': 'Хоспер, мангал, камадо, гриль',
    },
  },
  {
    id: 'firestarters-8',
    category: 'firestarters',
    name: 'Парафиновый розжиг',
    variant: '8 кубиков',
    price: 120,
    priceWholesale: 90,
    wholesaleMin: 50,
    sku: 'PFR-8',
    badge: '🌿 Экологичный',
    badgeClass: 'bg-green-500/20 text-green-400 border-green-500/30',
    image: '/images/firestarters-8.jpg',
    description: 'Натуральный парафиновый розжиг без запаха. Поджигает уголь за 5-7 минут. Без химии.',
    features: ['10 минут горения кубика', 'Без запаха и токсинов', 'Розжиг за 5-7 минут', 'Можно в сырую погоду', 'Натуральный состав'],
    specs: {
      'Количество': '8 кубиков',
      'Время горения': '10 минут / кубик',
      'Состав': 'Парафин + прессованные опилки',
      'Запах': 'Отсутствует',
      'Применение': 'Уголь, камин, самовар, котёл',
    },
  },
]

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

  const filtered = products.filter(
    (p) => activeCategory === 'all' || p.category === activeCategory
  )

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                      t.src = '/images/product-placeholder.jpg'
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
