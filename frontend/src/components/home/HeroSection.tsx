import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown, Star, ArrowRight } from 'lucide-react'

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.play().catch(() => {
        // Autoplay might be blocked - fallback is handled via poster
      })
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="/images/hero-poster.jpg"
        >
          <source src="/videos/charcoal-bg.mp4" type="video/mp4" />
          <source src="/videos/charcoal-bg.webm" type="video/webm" />
        </video>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/70 via-[#0A0A0A]/50 to-[#0A0A0A]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/60 via-transparent to-[#0A0A0A]/40" />

        {/* Ember glow at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-brand-orange/8 to-transparent" />
      </div>

      {/* Floating particles */}
      <FireParticles />

      {/* Content */}
      <div className="relative z-10 container-custom text-center pt-24">
        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8"
        >
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-brand-gold text-brand-gold" />
            ))}
          </div>
          <span className="text-white/80 text-sm font-medium">Доверяют 500+ ресторанов России</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-none mb-6 text-balance"
        >
          Уголь который{' '}
          <span className="relative inline-block">
            <span className="gradient-text">горит 8 часов</span>
            <motion.span
              className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-orange to-brand-gold rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-white/60 text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Брикеты Pini Kay — 900°C без дыма и запаха.
          Для хосперов, мангалов и гриль-ресторанов.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to="/order"
            className="btn-primary text-lg px-10 py-5 animate-glow"
          >
            Оставить заявку
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/products"
            className="btn-secondary text-lg px-10 py-5"
          >
            Смотреть продукты
          </Link>
        </motion.div>

        {/* Key stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-wrap justify-center gap-8 mt-16"
        >
          {[
            { value: '8ч', label: 'горения' },
            { value: '900°C', label: 'температура' },
            { value: '1:7', label: 'замена угля' },
            { value: '0', label: 'дыма' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display font-black text-3xl md:text-4xl gradient-text">{stat.value}</div>
              <div className="text-white/40 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
      >
        <span className="text-xs uppercase tracking-widest">Прокрутить</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>
    </section>
  )
}

// Pre-compute random values outside component to keep render pure
const FIRE_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  yEnd: -(200 + Math.random() * 200),
  xEnd: (Math.random() - 0.5) * 60,
  duration: 2 + Math.random() * 2,
  delay: Math.random() * 3,
  left: `${10 + (i * 8) % 80}%`,
}))

function FireParticles() {
  return (
    <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
      {FIRE_PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-brand-orange rounded-full opacity-60"
          style={{ left: p.left, bottom: '10%' }}
          animate={{ y: [0, p.yEnd], x: [0, p.xEnd], opacity: [0.6, 0], scale: [1, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
