import { useState, useEffect, startTransition } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone } from 'lucide-react'
import clsx from 'clsx'
import FlameLogo from '@/components/ui/Flamelogo'

const navLinks = [
  { href: '/', label: 'Главная' },
  { href: '/products', label: 'Продукты' },
  { href: '/firestarters', label: 'Розжиг' },
  { href: '/how-to-use', label: 'Как использовать' },
  { href: '/comparison', label: 'Сравнение' },
  { href: '/reviews', label: 'Отзывы' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    startTransition(() => setIsMobileOpen(false))
  }, [pathname])

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/5 py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <FlameLogo size={38} />
          <div className="leading-none">
            <div className="font-display font-black text-base text-white tracking-tight">
              Брикет
              <span className="gradient-text">-Бери</span>
            </div>
            <div className="text-[10px] text-white/40 font-medium tracking-widest uppercase">
              Pini Kay · Опт
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                pathname === link.href
                  ? 'text-brand-orange bg-brand-orange/10'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden lg:flex items-center gap-4">
          <a
            href="tel:+79000000000"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            <Phone className="w-4 h-4 text-brand-orange" />
            <span>+7 (900) 000-00-00</span>
          </a>
          <Link to="/order" className="btn-primary py-2.5 px-5 text-sm">
            Оставить заявку
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Меню"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-[#111111] border-t border-white/5 overflow-hidden"
          >
            <div className="container-custom py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={clsx(
                    'block px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    pathname === link.href
                      ? 'text-brand-orange bg-brand-orange/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/5 space-y-3">
                <a
                  href="tel:+79000000000"
                  className="flex items-center gap-2 px-4 text-white/70 text-sm"
                >
                  <Phone className="w-4 h-4 text-brand-orange" />
                  +7 (900) 000-00-00
                </a>
                <Link to="/order" className="btn-primary w-full text-center text-sm py-3">
                  Оставить заявку
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
