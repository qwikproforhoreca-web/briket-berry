import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Play, Clock, Thermometer, Package, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'

const rozhigSteps = [
  {
    step: '01',
    time: '0-2 мин',
    title: 'Подготовка',
    description: 'Уложите брикеты вертикально в хоспер или мангал (отверстиями вверх). Оставьте небольшие зазоры между брикетами для циркуляции воздуха.',
    tip: 'Используйте трубу-зажигатель для ускорения розжига',
    color: 'bg-brand-orange',
  },
  {
    step: '02',
    time: '2-7 мин',
    title: 'Розжиг',
    description: 'Положите 1-2 парафиновых кубика в центр брикетов и поджгите зажигалкой. НЕ используйте жидкости для розжига — химия испортит вкус мяса.',
    tip: 'Парафиновый розжиг безопасен и не оставляет запаха',
    color: 'bg-amber-500',
  },
  {
    step: '03',
    time: '7-30 мин',
    title: 'Разгорание',
    description: 'Брикеты начнут разгораться от центра. Появится белая зола на поверхности — признак готовности. Температура поднимается до рабочей за 25-30 минут.',
    tip: 'Не закрывайте крышку хоспера на этом этапе',
    color: 'bg-brand-gold',
  },
  {
    step: '04',
    time: '30+ мин',
    title: 'Готово к работе',
    description: 'Все брикеты покрыты белой золой и красно светятся. Температура достигла 700-900°C. Можно приступать к приготовлению!',
    tip: 'Следующая дозагрузка обычно требуется через 10-12 часов',
    color: 'bg-red-500',
  },
]

const temperatureTable = [
  { dish: 'Стейк (rare/medium rare)', temp: '800-900°C', time: '3-4 мин' },
  { dish: 'Стейк (well done)', temp: '600-700°C', time: '8-10 мин' },
  { dish: 'Шашлык / шаурма', temp: '500-600°C', time: '15-20 мин' },
  { dish: 'Рыба и морепродукты', temp: '400-500°C', time: '8-12 мин' },
  { dish: 'Овощи гриль', temp: '350-450°C', time: '10-15 мин' },
  { dish: 'Курица (целая)', temp: '300-400°C', time: '40-60 мин' },
]

const faqItems = [
  {
    q: 'Можно ли дозажигать брикеты?',
    a: 'Да! Это одно из главных преимуществ Pini Kay. Брикеты можно погасить и разжечь снова. Срок службы одного брикета — несколько циклов.',
  },
  {
    q: 'Почему брикеты дымят при первом розжиге?',
    a: 'Небольшой дым в начале — это нормально. Брикеты полностью выгорают в течение 5-7 минут. Затем горение становится бездымным.',
  },
  {
    q: 'Сколько брикетов нужно на одну смену?',
    a: 'Базовый расчёт: 1 коробка (10 кг) на 1 хоспер за 12 часовую смену. Для 2 хосперов — 2 коробки на смену.',
  },
  {
    q: 'Безопасен ли парафиновый розжиг для еды?',
    a: 'Абсолютно. Парафин полностью сгорает за 10 минут ещё до того, как вы начнёте готовить. Никаких химикатов или запахов не передаётся продуктам.',
  },
  {
    q: 'Как правильно хранить брикеты?',
    a: 'В сухом, проветриваемом помещении, в заводской упаковке. Избегайте влаги — если брикеты намокли, просушите 24-48 часов перед использованием.',
  },
  {
    q: 'Подходят ли брикеты для домашнего гриля?',
    a: 'Да, Pini Kay подходит для любых грилей, мангалов и хосперов. Особенно эффективен в закрытых системах (хоспер, камадо).',
  },
]

export default function HowToUsePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  return (
    <>
      <Helmet>
        <title>Как использовать угольные брикеты Pini Kay | Брикет-Бери</title>
        <meta
          name="description"
          content="Подробная инструкция по розжигу брикетов Pini Kay. Как правильно разжечь хоспер за 30 минут, поддерживать температуру 900°C, хранить брикеты"
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://briket-berry.ru/how-to-use" />
        <meta property="og:title" content="Как правильно использовать брикеты Pini Kay" />
        <meta property="og:description" content="Пошаговая инструкция по розжигу и работе с брикетами для хосперов и мангалов." />
        <meta property="og:url" content="https://briket-berry.ru/how-to-use" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        })}</script>
      </Helmet>

      {/* Hero */}
      <div className="pt-28 pb-16 bg-[#0A0A0A]">
        <div className="container-custom">
          <div className="fire-badge mb-4">📋 Инструкция</div>
          <h1 className="section-title mb-4">
            Как использовать{' '}
            <span className="gradient-text">Pini Kay</span>
          </h1>
          <p className="section-subtitle max-w-2xl">
            Подробное руководство по розжигу, поддержанию температуры, хранению и применению в разных устройствах
          </p>

          {/* Quick nav */}
          <div className="flex flex-wrap gap-3 mt-8">
            {[
              { label: '🔥 Розжиг', href: '#rozhig' },
              { label: '🌡️ Температура', href: '#temperature' },
              { label: '🏪 Применение', href: '#application' },
              { label: '📦 Хранение', href: '#storage' },
              { label: '▶️ Видео', href: '#video' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white/60 hover:text-white hover:border-brand-orange/30 text-sm transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Rozzhig Steps */}
      <section id="rozhig" className="section-padding bg-[#111111]">
        <div className="container-custom">
          <h2 className="section-title mb-3">Процесс розжига</h2>
          <p className="section-subtitle mb-12">4 шага до идеальной температуры</p>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-7 top-10 bottom-10 w-0.5 bg-gradient-to-b from-brand-orange via-brand-gold to-red-500" />

            <div className="space-y-6">
              {rozhigSteps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6"
                >
                  <div className={`flex-shrink-0 w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center font-display font-black text-white text-lg relative z-10 shadow-lg`}>
                    {step.step}
                  </div>
                  <div className="card flex-1 p-6">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                      <h3 className="font-bold text-white text-xl">{step.title}</h3>
                      <span className="text-white/30 text-sm flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {step.time}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed mb-3">{step.description}</p>
                    <div className="flex items-start gap-2 text-brand-orange/80 text-xs">
                      <span className="mt-0.5">💡</span>
                      <span>{step.tip}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Temperature Guide */}
      <section id="temperature" className="section-padding bg-[#0A0A0A]">
        <div className="container-custom">
          <h2 className="section-title mb-3">Температурный режим</h2>
          <p className="section-subtitle mb-12">Оптимальные температуры для разных блюд</p>

          <div className="card overflow-hidden max-w-3xl mx-auto">
            <div className="grid grid-cols-3 bg-[#111111] border-b border-white/5 text-white/40 text-sm">
              <div className="p-4 font-medium">Блюдо</div>
              <div className="p-4 text-center font-medium border-l border-white/5">Температура</div>
              <div className="p-4 text-center font-medium border-l border-white/5">Время</div>
            </div>
            {temperatureTable.map((row, i) => (
              <motion.div
                key={row.dish}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-3 border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
              >
                <div className="p-4 text-white/70 text-sm">{row.dish}</div>
                <div className="p-4 text-center border-l border-white/5">
                  <span className="text-brand-orange font-semibold text-sm">{row.temp}</span>
                </div>
                <div className="p-4 text-center border-l border-white/5 text-white/50 text-sm">{row.time}</div>
              </motion.div>
            ))}
          </div>

          {/* Temperature control tips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-3xl mx-auto">
            {[
              { title: '🔺 Повысить', tips: ['Раздвинуть брикеты', 'Открыть поддувало', 'Добавить свежие брикеты'] },
              { title: '🔻 Понизить', tips: ['Закрыть поддувало', 'Поднять решётку выше', 'Раздвинуть брикеты дальше'] },
              { title: '⚖️ Поддерживать', tips: ['3-4 брикета поверх горящих', 'Раз в 2-3 часа', 'Контролировать поддувало'] },
            ].map((block) => (
              <div key={block.title} className="card p-5">
                <h3 className="font-semibold text-white mb-3">{block.title}</h3>
                <ul className="space-y-1.5">
                  {block.tips.map((tip) => (
                    <li key={tip} className="text-white/50 text-xs flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-brand-orange flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application */}
      <section id="application" className="section-padding bg-[#111111]">
        <div className="container-custom">
          <h2 className="section-title mb-3">Применение</h2>
          <p className="section-subtitle mb-12">Pini Kay для разных типов оборудования</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🏪', name: 'Хоспер', load: '10 кг (1 коробка)', duration: '10-12 ч', note: 'Закрытая камера увеличивает время горения' },
              { icon: '🔥', name: 'Мангал', load: '8-10 кг', duration: '8-12 ч', note: 'Ветер увеличивает расход' },
              { icon: '🥘', name: 'Камадо', load: '2-3 кг', duration: '6-8 ч', note: 'Идеальное сочетание — камадо держит температуру' },
              { icon: '🍖', name: 'Гриль', load: '1.5-2 кг', duration: '3-4 ч', note: 'Используйте один отсек для брикетов' },
            ].map((device) => (
              <div key={device.name} className="card p-6">
                <div className="text-3xl mb-4">{device.icon}</div>
                <h3 className="font-bold text-white text-lg mb-3">{device.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <Package className="w-3.5 h-3.5 text-brand-orange" />
                    Загрузка: {device.load}
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock className="w-3.5 h-3.5 text-brand-orange" />
                    Работает: {device.duration}
                  </div>
                  <p className="text-white/30 text-xs mt-3 leading-relaxed">{device.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Storage */}
      <section id="storage" className="section-padding bg-[#0A0A0A]">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="section-title mb-3">Хранение</h2>
            <p className="section-subtitle mb-10">Как правильно хранить брикеты Pini Kay</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="card p-6 border-green-500/20">
                <h3 className="font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  ✅ Правильно
                </h3>
                <ul className="space-y-2">
                  {[
                    'Сухое, проветриваемое помещение',
                    'В заводской упаковке до использования',
                    'На поддонах или стеллажах',
                    'Температура -20°C до +40°C',
                  ].map((item) => (
                    <li key={item} className="text-white/60 text-sm flex items-center gap-2">
                      <span className="text-green-400">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-6 border-red-500/20">
                <h3 className="font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  ❌ Неправильно
                </h3>
                <ul className="space-y-2">
                  {[
                    'Влажное помещение или под дождём',
                    'Рядом с источниками тепла > 60°C',
                    'Смешивать с обычным углём',
                    'На земле без поддона',
                  ].map((item) => (
                    <li key={item} className="text-white/60 text-sm flex items-center gap-2">
                      <span className="text-red-400">✗</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card p-5 bg-brand-orange/5 border-brand-orange/20">
              <div className="flex gap-3">
                <Thermometer className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">Срок хранения</p>
                  <p className="text-white/50 text-sm">В запечатанной упаковке — <strong className="text-white">неограниченно</strong>. В вскрытой упаковке в сухом месте — <strong className="text-white">12+ месяцев</strong>. Намокшие брикеты просушите 24-48 часов.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Tutorial */}
      <section id="video" className="section-padding bg-[#111111]">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="section-title mb-3 text-center">Видео-инструкция</h2>
            <p className="section-subtitle mb-10 text-center">Смотрите как профессионально разжечь хоспер</p>

            <div
              className="relative aspect-video bg-[#0A0A0A] rounded-2xl overflow-hidden cursor-pointer group border border-white/5 hover:border-brand-orange/30 transition-colors"
              onClick={() => setIsVideoPlaying(true)}
            >
              {isVideoPlaying ? (
                <video
                  src="/videos/tutorial.mp4"
                  autoPlay
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <img
                    src="/images/video-poster.jpg"
                    alt="Видео-инструкция"
                    className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-80"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement
                      t.style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-brand-orange rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,107,43,0.5)] group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-white/80 text-sm">Нажмите для воспроизведения</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <HelpCircle className="w-10 h-10 text-brand-orange mx-auto mb-4" />
              <h2 className="section-title">Часто задаваемые вопросы</h2>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <div
                  key={i}
                  className={clsx(
                    'card overflow-hidden transition-all duration-300',
                    openFaq === i ? 'border-brand-orange/20' : ''
                  )}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-5 flex items-center justify-between gap-4 text-left"
                  >
                    <span className="text-white font-medium">{item.q}</span>
                    {openFaq === i
                      ? <ChevronUp className="w-4 h-4 text-brand-orange flex-shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
                    }
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-white/60 text-sm leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
