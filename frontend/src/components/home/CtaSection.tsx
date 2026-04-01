import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Phone } from 'lucide-react'

export default function CtaSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/cta-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]" />
      </div>

      {/* Animated embers */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-brand-orange/60"
            style={{
              left: `${20 + i * 10}%`,
              bottom: '15%',
            }}
            animate={{
              y: [0, -(150 + i * 30)],
              opacity: [0.6, 0],
              scale: [1, 0],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      <div className="container-custom relative">
        <div className="max-w-2xl">
          <div className="fire-badge mb-6">🔥 Специальное предложение</div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            Готовы перейти на{' '}
            <span className="gradient-text">профессиональный уголь?</span>
          </h2>

          <p className="text-white/60 text-lg md:text-xl mb-4 leading-relaxed">
            Оставьте заявку сегодня и получите бесплатную консультацию по подбору объёма для вашего заведения.
          </p>

          <ul className="space-y-2 mb-10">
            {[
              '✅ Расчёт расхода для вашего заведения бесплатно',
              '✅ Пробная партия для проверки качества',
              '✅ Работаем 10:00 – 18:00, пн–пт',
              '✅ Оплата после получения для постоянных клиентов',
            ].map((item) => (
              <li key={item} className="text-white/70 text-sm">
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/order" className="btn-primary text-lg">
              Оставить заявку
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="tel:+79000000000"
              className="btn-secondary text-lg"
            >
              <Phone className="w-5 h-5" />
              Позвонить сейчас
            </a>
          </div>

          <p className="text-white/30 text-xs mt-6">
            Ответим в течение 30 минут в рабочее время (10:00 – 18:00)
          </p>
        </div>
      </div>
    </section>
  )
}
