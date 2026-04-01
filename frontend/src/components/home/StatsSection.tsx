import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface Stat {
  value: number
  suffix: string
  prefix?: string
  label: string
  description: string
  color: string
}

const stats: Stat[] = [
  {
    value: 500,
    suffix: '+',
    label: 'Ресторанов и кафе',
    description: 'Используют брикеты Pini Kay в своих заведениях',
    color: 'from-brand-orange to-brand-orange-dark',
  },
  {
    value: 8,
    suffix: ' часов',
    label: 'Непрерывного горения',
    description: 'Без дозагрузки и поддержки огня',
    color: 'from-brand-gold to-amber-500',
  },
  {
    value: 7,
    suffix: 'x',
    prefix: '',
    label: 'Эффективнее угля',
    description: '1 кг брикетов заменяет 7 кг обычного угля',
    color: 'from-brand-orange to-brand-gold',
  },
  {
    value: 900,
    suffix: '°C',
    label: 'Рабочая температура',
    description: 'Идеально для стейков и блюд на гриле',
    color: 'from-red-500 to-brand-orange',
  },
]

function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return

    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.floor(eased * target))

      if (progress >= 1) clearInterval(timer)
    }, 16)

    return () => clearInterval(timer)
  }, [target, duration, start])

  return count
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const count = useCounter(stat.value, 2000, isInView)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="card-hover p-8 text-center group cursor-default"
    >
      <div className={`font-display font-black text-6xl md:text-7xl bg-gradient-to-b ${stat.color} bg-clip-text text-transparent mb-3 leading-none`}>
        {stat.prefix}{count}{stat.suffix}
      </div>
      <div className="font-semibold text-white text-xl mb-2">{stat.label}</div>
      <div className="text-white/40 text-sm leading-relaxed">{stat.description}</div>
    </motion.div>
  )
}

export default function StatsSection() {
  return (
    <section className="section-padding bg-[#0A0A0A]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="fire-badge mb-4">
            🔥 Цифры говорят сами за себя
          </div>
          <h2 className="section-title mb-4">
            Почему выбирают{' '}
            <span className="gradient-text">Pini Kay</span>
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Профессиональный уголь для тех, кто ценит качество и не хочет тратить время на подготовку
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
