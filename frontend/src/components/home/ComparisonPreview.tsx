import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Check, X, ArrowRight } from 'lucide-react'

const rows = [
  { param: 'Время горения', piniKay: 'До 8 часов', regular: '1-2 часа', win: true },
  { param: 'Температура', piniKay: '900°C+', regular: '500-600°C', win: true },
  { param: 'Дым и запах', piniKay: 'Отсутствует', regular: 'Много дыма', win: true },
  { param: 'Зольность', piniKay: '< 3%', regular: '8-15%', win: true },
  { param: 'Эффективность', piniKay: '1 кг = 3 кг угля', regular: '1 кг = 1 кг', win: true },
  { param: 'Упаковка', piniKay: '1 коробка = 2 мешка (по 5 кг)', regular: '2 мешка = 10 кг', win: true },
  { param: 'Повторное использование', piniKay: 'Да', regular: 'Нет', win: true },
]

export default function ComparisonPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <section className="section-padding bg-[#0A0A0A]">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="fire-badge mb-4">⚡ Сравнение</div>
            <h2 className="section-title mb-4">
              Pini Kay против{' '}
              <span className="text-white/40">обычного угля</span>
            </h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Объективное сравнение по ключевым параметрам для ресторанного бизнеса
            </p>
          </div>

          {/* Table */}
          <div
            ref={ref}
            className="card overflow-hidden border border-white/5"
          >
            {/* Table header */}
            <div className="grid grid-cols-3 bg-[#111111] border-b border-white/5">
              <div className="p-4 text-white/40 text-sm font-medium">Параметр</div>
              <div className="p-4 text-center border-l border-white/5">
                <div className="inline-flex items-center gap-2 text-brand-orange font-bold text-sm">
                  🔥 Pini Kay
                </div>
              </div>
              <div className="p-4 text-center border-l border-white/5 text-white/40 text-sm font-medium">
                Обычный уголь
              </div>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <motion.div
                key={row.param}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="grid grid-cols-3 border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
              >
                <div className="p-4 text-white/60 text-sm flex items-center">{row.param}</div>
                <div className="p-4 text-center border-l border-white/5 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-green-400 text-sm font-medium">{row.piniKay}</span>
                </div>
                <div className="p-4 text-center border-l border-white/5 flex items-center justify-center gap-2">
                  <X className="w-4 h-4 text-red-400/60 flex-shrink-0" />
                  <span className="text-white/30 text-sm">{row.regular}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <Link to="/comparison" className="btn-ghost text-brand-orange font-semibold">
              Полное сравнение с экономическим расчётом
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
