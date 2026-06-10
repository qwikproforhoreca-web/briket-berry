import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { siteUrl } from '@/constants/site'

export default function PricesPage() {
  return (
    <>
      <Helmet>
        <title>Цены на брикеты и розжиг Pini Kay | Брикет-Бери</title>
        <meta
          name="description"
          content="Актуальные цены на угольные брикеты Pini Kay и парафиновый розжиг. Оптовые условия для ресторанов и кафе."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={siteUrl('/prices')} />
        <meta property="og:title" content="Цены на Pini Kay оптом" />
        <meta property="og:description" content="Прайс на брикеты и розжиг с оптовыми условиями поставки." />
        <meta property="og:url" content={siteUrl('/prices')} />
      </Helmet>

      <div className="pt-28 pb-16 bg-[#0A0A0A]">
        <div className="container-custom max-w-4xl">
          <h1 className="section-title mb-4">Цены и условия поставки</h1>
          <p className="section-subtitle mb-8">
            Стоимость зависит от объема и региона доставки. Ниже базовые ориентиры для опта.
          </p>

          <div className="card overflow-hidden">
            <div className="grid grid-cols-3 bg-[#111111] border-b border-white/5 text-white/40 text-sm">
              <div className="p-4">Позиция</div>
              <div className="p-4 text-center border-l border-white/5">Розница</div>
              <div className="p-4 text-center border-l border-white/5">Опт</div>
            </div>
            {[
              ['Брикеты Pini Kay, 10 кг', 'от 890 ₽', 'от 835 ₽ (от 10 коробок)'],
              ['Парафиновый розжиг, 8 кубиков', 'от 120 ₽', 'от 100 ₽ (от 20 упаковок)'],
            ].map((row) => (
              <div key={row[0]} className="grid grid-cols-3 border-b border-white/5 last:border-0">
                <div className="p-4 text-white/70 text-sm">{row[0]}</div>
                <div className="p-4 text-center border-l border-white/5 text-white/50 text-sm">{row[1]}</div>
                <div className="p-4 text-center border-l border-white/5 text-brand-orange text-sm font-medium">{row[2]}</div>
              </div>
            ))}
          </div>

          <div className="card p-6 mt-8">
            <h2 className="text-white font-semibold mb-3">Что входит в коммерческое предложение</h2>
            <ul className="text-white/60 text-sm space-y-2 mb-4">
              <li>- цена по объему заказа;</li>
              <li>- сроки и формат доставки по России;</li>
              <li>- рекомендации по расходу под вашу загрузку;</li>
              <li>- условия регулярных поставок.</li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn-secondary">Перейти в каталог</Link>
              <Link to="/order" className="btn-primary">Запросить прайс</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
