import { motion } from 'framer-motion'

interface FlameLogoProps {
  size?: number
  className?: string
  withGlow?: boolean
}

export default function FlameLogo({ size = 36, className = '', withGlow = true }: FlameLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Glow ring */}
      {withGlow && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,0,0.5) 0%, transparent 70%)',
            filter: 'blur(6px)',
          }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Flame SVG */}
      <motion.svg
        viewBox="0 0 32 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: size * 0.8, height: size * 0.9 }}
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <linearGradient id="flame-grad-1" x1="16" y1="36" x2="16" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#CC3300" />
            <stop offset="35%" stopColor="#FF6B00" />
            <stop offset="70%" stopColor="#FF9500" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
          <linearGradient id="flame-grad-2" x1="16" y1="36" x2="16" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF4400" />
            <stop offset="60%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#FFEC40" />
          </linearGradient>
          <filter id="flame-blur">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
        </defs>

        {/* Outer flame */}
        <motion.path
          d="M16 0C16 0 6 8 6 18C6 24.627 10.477 30 16 30C21.523 30 26 24.627 26 18C26 8 16 0 16 0Z"
          fill="url(#flame-grad-1)"
          animate={{
            d: [
              'M16 0C16 0 6 8 6 18C6 24.627 10.477 30 16 30C21.523 30 26 24.627 26 18C26 8 16 0 16 0Z',
              'M16 0C16 0 5 9 5.5 18.5C5.5 25.2 10.2 30.5 16 30C21.8 30.5 26.5 25.2 26.5 18.5C27 9 16 0 16 0Z',
              'M16 0C16 0 7 7 6.5 17.5C6.5 24.1 10.7 29.5 16 30C21.3 29.5 25.5 24.1 25.5 17.5C25 7 16 0 16 0Z',
            ],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Inner flame (brighter core) */}
        <motion.path
          d="M16 10C16 10 11 15 11 20C11 22.761 13.239 25 16 25C18.761 25 21 22.761 21 20C21 15 16 10 16 10Z"
          fill="url(#flame-grad-2)"
          animate={{
            d: [
              'M16 10C16 10 11 15 11 20C11 22.761 13.239 25 16 25C18.761 25 21 22.761 21 20C21 15 16 10 16 10Z',
              'M16 10C16 10 10.5 15.5 10.5 20.5C10.5 23.3 13 25.5 16 25C19 25.5 21.5 23.3 21.5 20.5C21.5 15.5 16 10 16 10Z',
              'M16 10C16 10 11.5 14.5 11.5 19.5C11.5 22.2 13.5 24.5 16 25C18.5 24.5 20.5 22.2 20.5 19.5C20.5 14.5 16 10 16 10Z',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          opacity={0.9}
        />

        {/* Bright tip */}
        <motion.ellipse
          cx="16"
          cy="20"
          rx="3"
          ry="4"
          fill="#FFEC80"
          opacity={0.7}
          animate={{ ry: [4, 3, 4.5, 4], opacity: [0.7, 1, 0.6, 0.7] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Ember/spark particles */}
        {[
          { cx: 12, delay: 0 },
          { cx: 20, delay: 0.5 },
          { cx: 14, delay: 1 },
        ].map((spark, i) => (
          <motion.circle
            key={i}
            cx={spark.cx}
            cy={8}
            r={1}
            fill="#FFD700"
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: [-5, -15],
              x: [0, (spark.cx - 16) * 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: spark.delay,
              ease: 'easeOut',
            }}
          />
        ))}
      </motion.svg>
    </div>
  )
}
