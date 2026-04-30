import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const faqItems = [
  {
    q: 'Сколько горят брикеты Pini Kay?',
    a: 'В среднем до 8 часов стабильного жара в зависимости от оборудования, тяги и загрузки.',
  },
  {
    q: 'Подходят ли брикеты для хоспера и мангала?',
    a: 'Да, брикеты подходят для хосперов, мангалов, грилей и других жарочных систем.',
  },
  {
    q: 'Есть ли дым и запах?',
    a: 'По сравнению с обычным углем дыма и резкого запаха заметно меньше при правильном розжиге.',
  },
  {
    q: 'Можно ли заказать оптом с доставкой по России?',
    a: 'Да, мы работаем с оптовыми заказами и помогаем подобрать логистику под ваш регион.',
  },
]

export default function FaqPage() {
  return (
    <>
      <Helmet>
        <title>Частые вопросы по брикетам Pini Kay | Брикет-Бери</title>
        <meta
          name="description"
          content="Ответы на частые вопросы о брикетах Pini Kay: время горения, применение в хосперах, опт, доставка и хранение."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://briket-berry.ru/faq" />
        <meta property="og:title" content="Частые вопросы по брикетам Pini Kay" />
        <meta property="og:description" content="Частые вопросы и ответы по использованию и закупке брикетного угля." />
        <meta property="og:url" content="https://briket-berry.ru/faq" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a,
            },
          })),
        })}</script>
      </Helmet>

      <div className="pt-28 pb-16 bg-[#0A0A0A]">
        <div className="container-custom max-w-3xl">
          <h1 className="section-title mb-4">Часто задаваемые вопросы</h1>
          <p className="section-subtitle mb-10">
            Короткие ответы по применению, поставкам и эффективности брикетов Pini Kay.
          </p>

          <div className="space-y-4">
            {faqItems.map((item) => (
              <article key={item.q} className="card p-6">
                <h2 className="text-white font-semibold mb-2">{item.q}</h2>
                <p className="text-white/60 text-sm">{item.a}</p>
              </article>
            ))}
          </div>

          <div className="card p-6 mt-8">
            <h2 className="text-white font-semibold mb-3">Не нашли ответ?</h2>
            <p className="text-white/60 text-sm mb-4">
              Оставьте заявку, и менеджер подберет решение под вашу кухню и формат работы.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/how-to-use" className="btn-secondary">Инструкция</Link>
              <Link to="/order" className="btn-primary">Задать вопрос и получить расчет</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
