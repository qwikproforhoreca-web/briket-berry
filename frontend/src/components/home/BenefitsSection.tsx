import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Clock, Wind, Leaf, TrendingDown, Thermometer, Package } from 'lucide-react'

const benefits = [
  {
    icon: Clock,
    title: 'До 8 часов горения',
    description: 'Загрузил один раз — работаешь весь день. Не нужно постоянно доливать и следить за жаром.',
    glow: 'rgba(255, 107, 43, 0.3)',
  },
  {
    icon: Wind,
    title: 'Без дыма и запаха',
    description: 'Гости не жалуются на дым, соседи молчат, проверяющие довольны. Идеально для работы в зале.',
    glow: 'rgba(100, 200, 255, 0.2)',
  },
  {
    icon: Leaf,
    title: 'Экологически чистый',
    description: 'Только берёзовая древесина без химических добавок и связующих. Безопасен для здоровья.',
    glow: 'rgba(50, 200, 100, 0.2)',
  },
  {
    icon: TrendingDown,
    title: 'Экономия до 60%',
    description: '1 кг брикетов заменяет 7 кг обычного угля. Меньше закупки, меньше хранения, меньше затрат.',
    glow: 'rgba(212, 160, 23, 0.3)',
  },
  {
    icon: Thermometer,
    title: 'Температура 900°C',
    description: 'Равномерный, стабильный жар без «горячих точек». Стейк с идеальной корочкой каждый раз.',
    glow: 'rgba(220, 50, 50, 0.3)',
  },
  {
    icon: Package,
    title: 'Удобство хранения',
    description: 'Компактные брикеты в ящиках по 10 кг. Не пачкают руки, не рассыпаются, долго хранятся.',
    glow: 'rgba(255, 107, 43, 0.2)',
  },
]

function BenefitCard({
  benefit,
  index,
}: {
  benefit: (typeof benefits)[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })
  const Icon = benefit.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group card p-8 cursor-default transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
      style={{
        '--glow': benefit.glow,
      } as React.CSSProperties}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 50%, ${benefit.glow}, transparent 70%)` }}
      />

      {/* Border glow on hover */}
      <div className="absolute inset-0 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors duration-500" />

      {/* Icon */}
      <div
        className="relative w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
        style={{ background: benefit.glow.replace('0.3', '0.15').replace('0.2', '0.15') }}
      >
        <Icon className="w-7 h-7 text-brand-orange group-hover:text-white transition-colors duration-300" />
      </div>

      {/* Content */}
      <h3 className="relative font-display font-bold text-xl text-white mb-3 group-hover:text-brand-orange transition-colors duration-300">
        {benefit.title}
      </h3>
      <p className="relative text-white/50 text-sm leading-relaxed group-hover:text-white/70 transition-colors duration-300">
        {benefit.description}
      </p>
    </motion.div>
  )
}

export default function BenefitsSection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const isHeaderInView = useInView(headerRef, { once: true })

  return (
    <section className="section-padding bg-[#111111] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-orange/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-custom relative">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            className="fire-badge mb-4"
          >
            ✨ Преимущества
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="section-title mb-4"
          >
            Почему профессионалы{' '}
            <span className="gradient-text">выбирают нас</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="section-subtitle max-w-2xl mx-auto"
          >
            Pini Kay — не просто уголь. Это решение для тех, кто хочет
            готовить лучше, тратить меньше и не думать о топливе во время работы.
          </motion.p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <BenefitCard key={benefit.title} benefit={benefit} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
