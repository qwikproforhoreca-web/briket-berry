import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    emoji: '📦',
    title: 'Уложите брикеты',
    description: 'Поставьте брикеты вертикально в хоспер или мангал. Оставьте небольшие зазоры для циркуляции воздуха.',
    time: '2 мин',
    color: 'from-brand-orange to-amber-500',
  },
  {
    number: '02',
    emoji: '🔥',
    title: 'Поджгите розжиг',
    description: 'Положите 1-2 парафиновых кубика в центр и поджгите зажигалкой. Никакой жидкости — только натуральный парафин.',
    time: '5-7 мин',
    color: 'from-amber-500 to-brand-gold',
  },
  {
    number: '03',
    emoji: '🌡️',
    title: 'Дождитесь жара',
    description: 'Брикеты покроются белой золой и начнут светиться. Когда все раскалились — температура достигла 900°C.',
    time: '25-30 мин',
    color: 'from-brand-gold to-brand-orange',
  },
  {
    number: '04',
    emoji: '🍖',
    title: 'Начинайте готовить',
    description: 'Равномерный жар без вспышек и дыма. Следующая дозагрузка обычно требуется через 10-12 часов.',
    time: '10-12 часов',
    color: 'from-brand-orange to-red-500',
  },
]

export default function HowToStart() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <section className="section-padding bg-[#111111] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,107,43,0.06),transparent_60%)] pointer-events-none" />

      <div className="container-custom relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="fire-badge mb-4">📋 Инструкция</div>
          <h2 className="section-title mb-4">
            Готово к работе через{' '}
            <span className="gradient-text">30 минут</span>
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Никакого опыта не нужно. Простой процесс, который освоит любой сотрудник кухни.
          </p>
        </div>

        {/* Steps */}
        <div ref={ref} className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-16 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-px bg-gradient-to-r from-brand-orange/30 via-brand-gold/50 to-brand-orange/30" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative group"
              >
                <div className="card p-6 text-center hover:border-brand-orange/20 transition-all duration-300 hover:-translate-y-1">
                  {/* Step number */}
                  <div className={`inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4 bg-gradient-to-br ${step.color} text-2xl shadow-lg`}>
                    {step.emoji}
                  </div>

                  {/* Time badge */}
                  <div className="inline-flex items-center px-2.5 py-1 bg-white/5 rounded-full text-xs text-white/40 mb-3">
                    ⏱ {step.time}
                  </div>

                  {/* Number */}
                  <div className="font-display font-black text-5xl text-white/5 absolute top-4 right-4 leading-none select-none">
                    {step.number}
                  </div>

                  <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/how-to-use" className="btn-secondary">
            Подробная инструкция с видео
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
