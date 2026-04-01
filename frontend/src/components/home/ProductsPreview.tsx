import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Clock, Thermometer, Package } from 'lucide-react'

const products = [
  {
    id: 'pini-kay-10',
    name: 'Pini Kay Брикеты',
    subtitle: '10 кг — 1 ящик',
    price: 'от 890 ₽',
    priceWholesale: 'опт от 750 ₽/кг',
    image: '/images/pini-kay-product.jpg',
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
    id: 'firestarters',
    name: 'Парафиновый розжиг',
    subtitle: '8 кубиков в упаковке',
    price: 'от 120 ₽',
    priceWholesale: 'опт: скидка 30%',
    image: '/images/firestarters-product.jpg',
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

export default function ProductsPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

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
          {products.map((product, i) => (
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
                    target.src = '/images/product-placeholder.jpg'
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
