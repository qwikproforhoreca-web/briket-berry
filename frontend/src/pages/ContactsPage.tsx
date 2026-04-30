import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import {
  LEGAL_ADDRESS,
  LEGAL_BANK,
  LEGAL_BIK,
  LEGAL_EMAIL,
  LEGAL_ENTITY_NAME,
  LEGAL_INN,
  LEGAL_KS,
  LEGAL_OGRNIP,
  LEGAL_PHONE,
  LEGAL_PHONE_DIGITS,
  LEGAL_RS,
} from '@/constants/legal'

export default function ContactsPage() {
  return (
    <>
      <Helmet>
        <title>Контакты Брикет-Бери | Поставки по России</title>
        <meta
          name="description"
          content="Контакты и реквизиты продавца: ИП Бессонов Александр Владимирович. Договор заключается с ИП Бессонов А.В."
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
          telephone: LEGAL_PHONE,
          email: LEGAL_EMAIL,
          address: {
            '@type': 'PostalAddress',
            streetAddress: LEGAL_ADDRESS,
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
            <a href={`tel:+${LEGAL_PHONE_DIGITS}`} className="card p-6 hover:border-brand-orange/30 transition-colors">
              <Phone className="w-5 h-5 text-brand-orange mb-3" />
              <div className="text-white font-semibold mb-1">Телефон</div>
              <div className="text-white/60 text-sm">{LEGAL_PHONE}</div>
            </a>
            <a href={`mailto:${LEGAL_EMAIL}`} className="card p-6 hover:border-brand-orange/30 transition-colors">
              <Mail className="w-5 h-5 text-brand-orange mb-3" />
              <div className="text-white font-semibold mb-1">Эл. почта</div>
              <div className="text-white/60 text-sm">{LEGAL_EMAIL}</div>
            </a>
            <div className="card p-6">
              <MapPin className="w-5 h-5 text-brand-orange mb-3" />
              <div className="text-white font-semibold mb-1">Адрес</div>
              <div className="text-white/60 text-sm">{LEGAL_ADDRESS}</div>
            </div>
          </div>

          <div className="card p-6 mb-8">
            <h2 className="text-white font-semibold mb-3">Реквизиты продавца</h2>
            <div className="space-y-1.5 text-white/65 text-sm">
              <p><span className="text-white/40">Наименование:</span> {LEGAL_ENTITY_NAME}</p>
              <p><span className="text-white/40">ИНН:</span> {LEGAL_INN}</p>
              <p><span className="text-white/40">ОГРНИП:</span> {LEGAL_OGRNIP}</p>
              <p><span className="text-white/40">Юридический адрес:</span> {LEGAL_ADDRESS}</p>
              <p><span className="text-white/40">Фактический адрес:</span> {LEGAL_ADDRESS}</p>
              <p><span className="text-white/40">Банк:</span> {LEGAL_BANK}</p>
              <p><span className="text-white/40">БИК:</span> {LEGAL_BIK}</p>
              <p><span className="text-white/40">К/с:</span> {LEGAL_KS}</p>
              <p><span className="text-white/40">Р/с:</span> {LEGAL_RS}</p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-white font-semibold mb-3">Запросить коммерческое предложение</h2>
            <p className="text-white/60 text-sm mb-4">
              Подготовим предложение с ценой, сроками поставки и расчетом объема под ваш формат кухни.
            </p>
            <p className="text-white/60 text-sm mb-4">
              Договор заключается с ИП Бессонов Александр Владимирович. Претензии по качеству товара
              принимаются по адресу электронной почты{' '}
              <a href={`mailto:${LEGAL_EMAIL}`} className="text-brand-orange hover:underline">{LEGAL_EMAIL}</a>{' '}
              и по телефону{' '}
              <a href={`tel:+${LEGAL_PHONE_DIGITS}`} className="text-brand-orange hover:underline">{LEGAL_PHONE}</a>.
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
