import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react'
import FlameLogo from '@/components/ui/Flamelogo'

const footerLinks = {
  products: [
    { href: '/products', label: 'Брикеты Pini Kay' },
    { href: '/firestarters', label: 'Парафиновый розжиг' },
    { href: '/how-to-use', label: 'Как использовать' },
    { href: '/comparison', label: 'Сравнение с аналогами' },
  ],
  company: [
    { href: '/reviews', label: 'Отзывы клиентов' },
    { href: '/order', label: 'Оставить заявку' },
    { href: '/order', label: 'Оптовые цены' },
    { href: '/#faq', label: 'Часто задаваемые вопросы' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <FlameLogo size={38} withGlow={false} />
              <div className="leading-none">
                <div className="font-display font-black text-base text-white tracking-tight">
                  Брикет<span className="gradient-text">-Бери</span>
                </div>
                <div className="text-[10px] text-white/40 font-medium tracking-widest uppercase">
                  Pini Kay · Опт
                </div>
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Профессиональные угольные брикеты Pini Kay для ресторанов, кафе и хосперов. Без дыма, без запаха — только идеальный жар.
            </p>
            <div className="flex gap-3">
              <a
                href="https://wa.me/79000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#25D366]/10 border border-[#25D366]/20 rounded-lg flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/briket_beri"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#0088cc]/10 border border-[#0088cc]/20 rounded-lg flex items-center justify-center text-[#0088cc] hover:bg-[#0088cc]/20 transition-colors"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="tel:+79000000000"
                className="w-10 h-10 bg-brand-orange/10 border border-brand-orange/20 rounded-lg flex items-center justify-center text-brand-orange hover:bg-brand-orange/20 transition-colors"
                aria-label="Телефон"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Продукты</h3>
            <ul className="space-y-2.5">
              {footerLinks.products.map((link) => (
                <li key={link.href + link.label}>
                  <Link to={link.href} className="text-white/50 hover:text-brand-orange text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Компания</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href + link.label}>
                  <Link to={link.href} className="text-white/50 hover:text-brand-orange text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Контакты</h3>
            <ul className="space-y-3">
              <li>
                <a href="tel:+79000000000" className="flex items-center gap-2.5 text-white/50 hover:text-white text-sm transition-colors">
                  <Phone className="w-4 h-4 text-brand-orange flex-shrink-0" />
                  +7 (900) 000-00-00
                </a>
              </li>
              <li>
                <a href="mailto:info@briket-berry.ru" className="flex items-center gap-2.5 text-white/50 hover:text-white text-sm transition-colors">
                  <Mail className="w-4 h-4 text-brand-orange flex-shrink-0" />
                  info@briket-berry.ru
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-white/50 text-sm">
                <MapPin className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
                <span>Москва · Пн–Пт 10:00 – 18:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm">
            © 2026 Брикет-Бери. Все права защищены.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-white/30 hover:text-white/60 text-xs transition-colors">
              Политика конфиденциальности
            </Link>
            <Link to="/terms" className="text-white/30 hover:text-white/60 text-xs transition-colors">
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
