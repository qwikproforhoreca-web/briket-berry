import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Check, X, TrendingDown, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

const comparisonRows = [
  { param: 'Время горения', piniKay: 'До 12 часов', regular: '1-2 часа', wood: '2-3 часа', piniWins: true },
  { param: 'Рабочая температура', piniKay: '900°C', regular: '500-600°C', wood: '400-500°C', piniWins: true },
  { param: 'Дым', piniKay: 'Отсутствует', regular: 'Много', wood: 'Очень много', piniWins: true },
  { param: 'Запах', piniKay: 'Отсутствует', regular: 'Есть', wood: 'Выраженный', piniWins: true },
  { param: 'Зольность', piniKay: '< 3%', regular: '8-15%', wood: '20-30%', piniWins: true },
  { param: 'Эффективность', piniKay: '1 кг = 3 кг угля', regular: '1 кг = 1 кг', wood: '1 кг = 0.5 кг', piniWins: true },
  { param: 'Эквивалент упаковки', piniKay: '1 коробка (10 кг) = 2 мешка по 5 кг', regular: '2 мешка = 10 кг', wood: '10 кг дров', piniWins: true },
  { param: 'Равномерность жара', piniKay: 'Высокая', regular: 'Низкая', wood: 'Низкая', piniWins: true },
  { param: 'Повторное использование', piniKay: 'Да', regular: 'Нет', wood: 'Нет', piniWins: true },
  { param: 'Хранение', piniKay: 'Любое', regular: 'Сухое', wood: 'Сухое', piniWins: true },
  { param: 'Экологичность', piniKay: '✅ Eco', regular: '⚠️ Хим. примеси', wood: '✅ Eco', piniWins: false },
]

const afterSwitchStats = [
  { label: 'Расход топлива', change: '-60%', color: 'text-green-400' },
  { label: 'Время на розжиг', change: '-70%', color: 'text-green-400' },
  { label: 'Зола после смены', change: '-80%', color: 'text-green-400' },
  { label: 'Жалобы на дым', change: '-100%', color: 'text-green-400' },
  { label: 'Качество блюд', change: '+30%', color: 'text-brand-orange' },
  { label: 'Средний чек', change: '+8%', color: 'text-brand-orange' },
]

export default function ComparisonPage() {
  return (
    <>
      <Helmet>
        <title>Pini Kay vs обычный уголь — сравнение | Брикет-Бери</title>
        <meta name="description" content="Детальное сравнение угольных брикетов Pini Kay с обычным берёзовым углём и дровами. Экономический расчёт для ресторанного бизнеса." />
      </Helmet>

      {/* Hero */}
      <div className="pt-28 pb-16 bg-[#0A0A0A]">
        <div className="container-custom">
          <div className="fire-badge mb-4">⚡ Сравнение</div>
          <h1 className="section-title mb-4">
            Pini Kay vs{' '}
            <span className="text-white/30">обычный уголь</span>
          </h1>
          <p className="section-subtitle max-w-2xl">
            Объективное сравнение по 10 ключевым параметрам. Цифры и факты, без маркетинга.
          </p>
        </div>
      </div>

      {/* Main comparison table */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-custom">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Table header */}
              <div className="grid grid-cols-4 bg-[#111111] rounded-t-2xl border border-white/5 border-b-0">
                <div className="p-5 text-white/40 text-sm font-medium">Параметр</div>
                <div className="p-5 text-center border-l border-white/5">
                  <div className="font-bold text-brand-orange">🔥 Pini Kay</div>
                  <div className="text-white/30 text-xs mt-0.5">Брикеты</div>
                </div>
                <div className="p-5 text-center border-l border-white/5">
                  <div className="font-semibold text-white/50">Берёзовый уголь</div>
                  <div className="text-white/20 text-xs mt-0.5">Обычный</div>
                </div>
                <div className="p-5 text-center border-l border-white/5">
                  <div className="font-semibold text-white/50">Дрова</div>
                  <div className="text-white/20 text-xs mt-0.5">Для сравнения</div>
                </div>
              </div>

              {/* Rows */}
              {comparisonRows.map((row, i) => (
                <motion.div
                  key={row.param}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-4 border border-white/5 border-t-0 last:rounded-b-2xl hover:bg-white/1 transition-colors"
                >
                  <div className="p-4 text-white/60 text-sm border-r border-white/5">{row.param}</div>
                  <div className="p-4 text-center border-r border-white/5 bg-brand-orange/2">
                    <span className="text-green-400 text-sm font-semibold flex items-center justify-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      {row.piniKay}
                    </span>
                  </div>
                  <div className="p-4 text-center border-r border-white/5">
                    <span className="text-white/30 text-sm flex items-center justify-center gap-1.5">
                      <X className="w-3.5 h-3.5 text-red-400/50" />
                      {row.regular}
                    </span>
                  </div>
                  <div className="p-4 text-center">
                    <span className="text-white/30 text-sm">{row.wood}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Economy calculation */}
      <section className="section-padding bg-[#111111]">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <TrendingDown className="w-10 h-10 text-brand-orange mx-auto mb-4" />
              <h2 className="section-title mb-4">Экономический расчёт</h2>
              <p className="section-subtitle">Ресторан с 2 хосперами, 12 часов работы в день</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Обычный уголь',
                  color: 'border-red-500/20 bg-red-500/3',
                  label: '❌ Невыгодно',
                  items: [
                    { label: 'Расход / хоспер / день', value: '30 кг (6 мешков по 5 кг)' },
                    { label: 'Итого в день (×2)', value: '60 кг (12 мешков)' },
                    { label: 'Стоимость / день', value: '5 400 ₽' },
                    { label: 'В месяц (25 дней)', value: '135 000 ₽' },
                    { label: 'В год', value: '1 620 000 ₽' },
                  ],
                  total: '1 620 000 ₽/год',
                  totalColor: 'text-red-400',
                },
                {
                  title: 'Pini Kay',
                  color: 'border-brand-orange/20 bg-brand-orange/3',
                  label: '✅ Выгоднее',
                  items: [
                    { label: 'Расход / хоспер / день', value: '10 кг (1 коробка)' },
                    { label: 'Итого в день (×2)', value: '20 кг (2 коробки)' },
                    { label: 'Стоимость / день', value: '1 780 ₽' },
                    { label: 'В месяц (25 дней)', value: '44 500 ₽' },
                    { label: 'В год', value: '534 000 ₽' },
                  ],
                  total: '534 000 ₽/год',
                  totalColor: 'text-green-400',
                },
              ].map((col) => (
                <div key={col.title} className={`card p-6 border-2 ${col.color}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-lg">{col.title}</h3>
                    <span className="text-xs px-2 py-1 bg-white/5 rounded-full text-white/50">{col.label}</span>
                  </div>
                  <div className="space-y-3 mb-5">
                    {col.items.map((item) => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="text-white/50">{item.label}</span>
                        <span className="text-white font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between">
                    <span className="text-white/60 font-medium">Итог:</span>
                    <span className={`font-display font-bold text-xl ${col.totalColor}`}>{col.total}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-white/30 text-xs text-center mt-4">
              Расчёт ориентировочный: мешок обычного угля принят как 5 кг, коробка Pini Kay — 10 кг.
            </p>
          </div>
        </div>
      </section>

      {/* After switch stats */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">
              Показатели после{' '}
              <span className="gradient-text">перехода на Pini Kay</span>
            </h2>
            <p className="section-subtitle">Реальные данные от наших клиентов</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {afterSwitchStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="card p-5 text-center"
              >
                <div className={`font-display font-black text-3xl mb-2 ${stat.color}`}>{stat.change}</div>
                <div className="text-white/40 text-xs leading-tight">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-[#111111]">
        <div className="container-custom text-center">
          <h2 className="section-title mb-6">
            Убедились в преимуществах?
          </h2>
          <p className="section-subtitle mb-8 max-w-md mx-auto">
            Оставьте заявку и получите первую партию для тестирования
          </p>
          <Link to="/order" className="btn-primary text-lg">
            Попробовать Pini Kay
            <LinkIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
