import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>О компании Брикет-Бери | Поставщик брикетов Pini Kay</title>
        <meta
          name="description"
          content="Брикет-Бери — поставщик угольных брикетов Pini Kay и розжига для ресторанов, хосперов и мангалов по России."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://briket-berry.ru/about" />
        <meta property="og:title" content="О компании Брикет-Бери" />
        <meta property="og:description" content="Поставки брикетного угля для HoReCa и гриль-заведений по России." />
        <meta property="og:url" content="https://briket-berry.ru/about" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'О компании Брикет-Бери',
          url: 'https://briket-berry.ru/about',
        })}</script>
      </Helmet>

      <div className="pt-28 pb-16 bg-[#0A0A0A]">
        <div className="container-custom max-w-4xl">
          <h1 className="section-title mb-4">О компании Брикет-Бери</h1>
          <p className="section-subtitle mb-10">
            Поставляем угольные брикеты Pini Kay и парафиновый розжиг для ресторанов, кафе, хосперов и гриль-проектов.
            Работаем по России и помогаем заведениям перейти на стабильный жар без лишнего дыма.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <div className="card p-5 text-center">
              <div className="font-display text-3xl text-brand-orange font-black">500+</div>
              <div className="text-white/50 text-sm">клиентов HoReCa</div>
            </div>
            <div className="card p-5 text-center">
              <div className="font-display text-3xl text-brand-orange font-black">8 ч</div>
              <div className="text-white/50 text-sm">стабильного горения</div>
            </div>
            <div className="card p-5 text-center">
              <div className="font-display text-3xl text-brand-orange font-black">RU</div>
              <div className="text-white/50 text-sm">поставки по России</div>
            </div>
          </div>

          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-3">Чем полезны бизнесу</h2>
            <ul className="text-white/60 text-sm space-y-2">
              <li>- стабильный жар для хосперов и мангалов;</li>
              <li>- ниже расход топлива по сравнению с обычным углем;</li>
              <li>- меньше дыма и запаха в зале/open kitchen;</li>
              <li>- прогнозируемые поставки для сезонных пиков.</li>
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-3">Доверие и прозрачность</h2>
            <p className="text-white/60 text-sm mb-4">
              По запросу предоставляем документы, условия поставки и рекомендации по внедрению в работу кухни.
              Для новых клиентов делаем расчет потребления и помогаем подобрать график закупок.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/cases" className="btn-secondary">Смотреть кейсы</Link>
              <Link to="/contacts" className="btn-secondary">Контакты</Link>
              <Link to="/order" className="btn-primary">Оставить заявку</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
