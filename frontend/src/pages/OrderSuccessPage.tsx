import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Phone, Home, ArrowRight } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

const EMBERS = Array.from({ length: 16 }, () => ({
  left: `${Math.random() * 100}%`,
  yEnd: -(200 + Math.random() * 300),
  duration: 3 + Math.random() * 2,
  delay: Math.random() * 4,
}))

export default function OrderSuccessPage() {
  const location = useLocation()
  const orderNumber = location.state?.orderNumber || '—'

  return (
    <>
      <Helmet>
        <title>Заявка принята | Брикет-Бери</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden">
        {/* Background embers */}
        <div className="absolute inset-0 pointer-events-none">
          {EMBERS.map((e, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-brand-orange/40"
              style={{ left: e.left, bottom: '10%' }}
              animate={{ y: [0, e.yEnd], opacity: [0.4, 0], scale: [1, 0] }}
              transition={{ duration: e.duration, repeat: Infinity, delay: e.delay, ease: 'easeOut' }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="card max-w-md w-full mx-4 p-10 text-center relative"
        >
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-green-400/15 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display font-bold text-3xl text-white mb-3"
          >
            Заявка принята!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/50 mb-2"
          >
            Номер заявки: <span className="text-brand-orange font-semibold">#{orderNumber}</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/50 text-sm mb-8"
          >
            Наш менеджер свяжется с вами в течение 30 минут для уточнения деталей и стоимости доставки.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            <a href="tel:+79000000000" className="flex items-center justify-center gap-2 btn-secondary w-full">
              <Phone className="w-4 h-4" />
              Позвонить нам
            </a>
            <Link to="/" className="flex items-center justify-center gap-2 btn-ghost text-white/50 w-full justify-center">
              <Home className="w-4 h-4" />
              На главную
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
