import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'

function toDigits(phone: string) {
  return phone.replace(/\D/g, '')
}

export default function ContactsPage() {
  const settings = useSettings()

  return (
    <>
      <Helmet>
        <title>Контакты Брикет-Бери | Поставки по России</title>
        <meta
          name="description"
          content="Контакты Брикет-Бери: телефон, email, адрес и условия поставки угольных брикетов Pini Kay по России."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://briket-berry.ru/contacts" />
        <meta property="og:title" content="Контакты Брикет-Бери" />
        <meta property="og:description" content="Связаться с нами по поставкам брикетов и розжига для HoReCa." />
        <meta property="og:url" content="https://briket-berry.ru/contacts" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Брикет-Бери',
          url: 'https://briket-berry.ru/contacts',
          telephone: settings.phone,
          email: settings.email,
          address: {
            '@type': 'PostalAddress',
            streetAddress: settings.address,
            addressCountry: 'RU',
          },
        })}</script>
      </Helmet>

      <div className="pt-28 pb-16 bg-[#0A0A0A]">
        <div className="container-custom max-w-4xl">
          <h1 className="section-title mb-4">Контакты</h1>
          <p className="section-subtitle mb-10">
            Работаем с ресторанами, кафе и гриль-проектами по всей России.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <a href={`tel:+${toDigits(settings.phone)}`} className="card p-6 hover:border-brand-orange/30 transition-colors">
              <Phone className="w-5 h-5 text-brand-orange mb-3" />
              <div className="text-white font-semibold mb-1">Телефон</div>
              <div className="text-white/60 text-sm">{settings.phone}</div>
            </a>
            <a href={`mailto:${settings.email}`} className="card p-6 hover:border-brand-orange/30 transition-colors">
              <Mail className="w-5 h-5 text-brand-orange mb-3" />
              <div className="text-white font-semibold mb-1">Email</div>
              <div className="text-white/60 text-sm">{settings.email}</div>
            </a>
            <div className="card p-6">
              <MapPin className="w-5 h-5 text-brand-orange mb-3" />
              <div className="text-white font-semibold mb-1">Адрес</div>
              <div className="text-white/60 text-sm">{settings.address}</div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-white font-semibold mb-3">Запросить коммерческое предложение</h2>
            <p className="text-white/60 text-sm mb-4">
              Подготовим предложение с ценой, сроками поставки и расчетом объема под ваш формат кухни.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/prices" className="btn-secondary">Смотреть цены</Link>
              <Link to="/order" className="btn-primary">Оставить заявку</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
