import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Flame, Clock, Thermometer, Package, AlertTriangle, CheckCircle, Zap, Home, ChefHat, Leaf, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { siteUrl } from '@/constants/site'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
}

const steps = [
  {
    step: '01',
    title: 'Разместите розжиг',
    desc: 'Положите 1–2 кубика под брикеты или на дно мангала / хоспера. Не нужен жидкий розжиг или газета.',
    icon: Package,
  },
  {
    step: '02',
    title: 'Подожгите уголок',
    desc: 'Поднесите зажигалку или спичку к углу кубика. Он загорается мгновенно — даже при ветре.',
    icon: Flame,
  },
  {
    step: '03',
    title: 'Подождите 8–12 минут',
    desc: 'Розжиг горит устойчивым пламенем 8–12 минут, передавая жар брикетам Pini Kay. Угли разгорятся полностью.',
    icon: Clock,
  },
  {
    step: '04',
    title: 'Готово к работе',
    desc: 'Через 20–25 минут брикеты покрыты серым пеплом — можно готовить. Никаких посторонних запахов.',
    icon: CheckCircle,
  },
]

const useCases = [
  { icon: ChefHat, title: 'Хоспер', desc: 'Быстрый, надёжный розжиг без запаха. Идеально для стейков и птицы.' },
  { icon: Flame, title: 'Мангал', desc: 'Загорается при любой погоде. Забудьте про жидкий розжиг навсегда.' },
  { icon: Home, title: 'Камин', desc: 'Чистый розжиг без дыма и смол. Безопасно для домашнего использования.' },
  { icon: Leaf, title: 'Камадо/гриль', desc: 'Точный контроль. Подходит для длительного копчения при низкой температуре.' },
  { icon: Zap, title: 'Туристический мангал', desc: 'Компактно берёте на природу — горит даже на ветру.' },
  { icon: Thermometer, title: 'Тандыр', desc: 'Стабильный старт для предварительного прогрева тандыра.' },
]

const specs = [
  { label: 'Время горения', value: '8–12 минут' },
  { label: 'Состав', value: 'Парафин, древесные опилки' },
  { label: 'Размер кубика', value: '4 × 4 × 2 см' },
  { label: 'В упаковке', value: '8 кубиков' },
  { label: 'Запах при горении', value: 'Нейтральный' },
  { label: 'Экологичность', value: 'Без химии, без токсинов' },
  { label: 'Влагоустойчивость', value: 'Горит даже слегка влажный' },
  { label: 'Хранение', value: 'До 3 лет при правильных условиях' },
]

const storageRules = [
  { icon: '🌡️', title: 'Температура', desc: 'Хранить при температуре ниже +35°C. При перегреве кубики могут деформироваться, но сохраняют свойства.' },
  { icon: '💧', title: 'Влажность', desc: 'Избегать длительного контакта с водой. Кубик горит даже влажным, но храните в сухом месте.' },
  { icon: '📦', title: 'Упаковка', desc: 'Хранить в закрытой оригинальной упаковке или герметичном пакете — парафин не впитывает запахи.' },
  { icon: '🔥', title: 'Огонь', desc: 'Держать вдали от открытого огня и нагревательных приборов. Температура вспышки +200°C.' },
  { icon: '☀️', title: 'Свет', desc: 'Прямые солнечные лучи могут деформировать кубики. Хранить в тени или коробке.' },
  { icon: '🏭', title: 'Промышленное хранение', desc: 'При хранении более 10 упаковок — в прохладном складском помещении. Срок годности 3 года.' },
]

export default function FirestartersPage() {
  return (
    <>
      <Helmet>
        <title>Парафиновый розжиг для мангала, хоспера, камина | Pini Kay</title>
        <meta
          name="description"
          content="Экологичный парафиновый розжиг Pini Kay — горит 8–12 минут, без запаха, без химии. Идеален для хоспера, мангала, камина, тандыра. Купить оптом для ресторана."
        />
        <meta name="keywords" content="парафиновый розжиг, розжиг для мангала, розжиг для хоспера, розжиг для камина, кубики розжига, экологичный розжиг, оптовый розжиг ресторан" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={siteUrl('/firestarters')} />
        <meta property="og:title" content="Парафиновый розжиг для хоспера и мангала" />
        <meta property="og:description" content="Розжиг Pini Kay для ресторанов и кафе: быстро, без запаха, без химии." />
        <meta property="og:url" content={siteUrl('/firestarters')} />
      </Helmet>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-orange opacity-50" />
        <div className="absolute top-20 right-10 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <span className="badge badge-gold mb-6 inline-flex">
              <Flame size={14} />
              Парафиновый розжиг
            </span>
            <h1 className="section-title mb-6">
              Розжиг, который{' '}
              <span className="gradient-text">работает всегда</span>
            </h1>
            <p className="section-subtitle mb-8">
              Натуральные парафиновые кубики Pini Kay — надёжный старт для вашего хоспера, мангала или камина.
              Без запаха, без химии, без нервов. Загорается с первой спички.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/order" className="btn-primary">
                <Flame size={18} />
                Заказать оптом
              </Link>
              <a href="#how-to-use" className="btn-secondary">
                Как использовать
              </a>
            </div>
          </motion.div>

          {/* Key facts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { value: '8–12', unit: 'минут', label: 'горения' },
              { value: '0', unit: 'запаха', label: 'и химии' },
              { value: '1', unit: 'спичка', label: 'для розжига' },
              { value: '3', unit: 'года', label: 'срок хранения' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="card text-center"
              >
                <div className="text-3xl font-black text-brand-orange font-display">{stat.value}</div>
                <div className="text-sm text-amber-400 font-semibold">{stat.unit}</div>
                <div className="text-xs text-brand-gray mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to use */}
      <section id="how-to-use" className="py-24 bg-brand-dark-card">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge badge-orange mb-4 inline-flex">Инструкция</span>
            <h2 className="section-title mb-4">Как использовать розжиг</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Четыре простых шага — и ваш уголь уже горит
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="card relative"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center text-xs font-black text-white">
                  {step.step}
                </div>
                <step.icon size={32} className="text-brand-orange mb-4" />
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-brand-gray text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Visual timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 p-6 rounded-2xl border border-brand-dark-border bg-brand-dark"
          >
            <h3 className="font-bold text-center mb-6 text-brand-gray text-sm uppercase tracking-wider">
              График температуры
            </h3>
            <div className="flex items-end justify-center gap-2 h-20">
              {[
                { label: '0 мин', height: '20%', color: 'bg-amber-900', temp: 'Поджиг' },
                { label: '2 мин', height: '50%', color: 'bg-amber-700', temp: '300°C' },
                { label: '5 мин', height: '75%', color: 'bg-orange-500', temp: '500°C' },
                { label: '10 мин', height: '100%', color: 'bg-brand-orange', temp: '650°C' },
                { label: '20 мин', height: '90%', color: 'bg-orange-600', temp: '700°C' },
                { label: '30 мин', height: '95%', color: 'bg-red-500', temp: '750°C+' },
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1 max-w-[80px]">
                  <span className="text-[10px] text-brand-gray">{bar.temp}</span>
                  <div
                    className={`w-full rounded-t-sm ${bar.color} transition-all`}
                    style={{ height: `calc(${bar.height})` }}
                  />
                  <span className="text-[10px] text-brand-gray">{bar.label}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-brand-gray mt-4">
              * Брикеты Pini Kay достигают рабочей температуры через 20–30 мин после поджига
            </p>
          </motion.div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-24">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge badge-orange mb-4 inline-flex">Применение</span>
            <h2 className="section-title mb-4">Где использовать розжиг</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Подходит для любого вида жарочного оборудования
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="card flex gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center flex-shrink-0 border border-brand-orange/20">
                  <useCase.icon size={22} className="text-brand-orange" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{useCase.title}</h3>
                  <p className="text-brand-gray text-sm">{useCase.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specs */}
      <section className="py-24 bg-brand-dark-card">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="badge badge-gold mb-4 inline-flex">Характеристики</span>
              <h2 className="section-title mb-6">Технические параметры</h2>
              <div className="divide-y divide-brand-dark-border">
                {specs.map((spec, i) => (
                  <div key={i} className="flex justify-between py-3">
                    <span className="text-brand-gray text-sm">{spec.label}</span>
                    <span className="font-semibold text-sm">{spec.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="badge badge-orange mb-4 inline-flex">Преимущества</span>
              <h2 className="section-title mb-6">Почему Pini Kay</h2>
              <div className="space-y-4">
                {[
                  { title: 'Без химии и токсинов', desc: 'Только парафин и древесные опилки. Никаких жидких ускорителей, никакого запаха еды.' },
                  { title: 'Работает в любую погоду', desc: 'Горит при ветре, влажности, морозе. Ваш мангал на улице будет работать всегда.' },
                  { title: 'Экономично', desc: 'Одного кубика достаточно для розжига полного хоспера. Не нужны дополнительные средства.' },
                  { title: 'Быстрый старт', desc: 'Загорается мгновенно. Полный розжиг брикетов — 20–25 минут вместо 40–60 с обычным углём.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <Star size={18} className="text-amber-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold mb-1">{item.title}</div>
                      <div className="text-brand-gray text-sm">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Storage */}
      <section className="py-24">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge badge-orange mb-4 inline-flex">
              <AlertTriangle size={14} />
              Хранение
            </span>
            <h2 className="section-title mb-4">Правила хранения</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Соблюдайте простые правила — розжиг сохранит свойства до 3 лет
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storageRules.map((rule, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="card"
              >
                <div className="text-3xl mb-3">{rule.icon}</div>
                <h3 className="font-bold mb-2">{rule.title}</h3>
                <p className="text-brand-gray text-sm leading-relaxed">{rule.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Safety note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 flex gap-4"
          >
            <AlertTriangle size={24} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-400 mb-1">Важно: меры безопасности</div>
              <p className="text-brand-gray text-sm">
                Используйте розжиг только по назначению. Хранить вдали от детей и домашних животных.
                Не использовать внутри помещений без вентиляции. После розжига убедитесь, что пламя стабильно.
                При случайном проглатывании — немедленно обратитесь к врачу.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-dark-card to-brand-dark">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title mb-4">
              Готовы заказать розжиг{' '}
              <span className="gradient-text">оптом?</span>
            </h2>
            <p className="section-subtitle max-w-xl mx-auto mb-8">
              Минимальный заказ от 50 упаковок. Специальные условия для ресторанов и сетей.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/order" className="btn-primary">
                <Flame size={18} />
                Оставить заявку
              </Link>
              <Link to="/products" className="btn-secondary">
                Посмотреть все товары
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
