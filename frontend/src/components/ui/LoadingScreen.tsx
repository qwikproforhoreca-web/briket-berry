import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-16 h-16 bg-brand-orange rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,107,43,0.5)]"
        >
          <Flame className="w-8 h-8 text-white" />
        </motion.div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-brand-orange rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
