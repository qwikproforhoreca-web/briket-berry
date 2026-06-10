import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { siteUrl } from '@/constants/site'

const cases = [
  {
    title: 'Стейк-хаус в Москве',
    result: '-35% расхода угля за 2 месяца',
    details: 'Перевели кухню на Pini Kay и стабилизировали температурный режим на вечерней посадке.',
  },
  {
    title: 'Сеть шаурмы (4 точки)',
    result: '-60% жалоб на дым',
    details: 'Убрали резкие запахи и добились ровной прожарки мяса на всех точках.',
  },
  {
    title: 'Гриль-кафе в Казани',
    result: '+18% повторных заказов блюд гриль',
    details: 'Стабильный жар улучшил качество подачи в пиковые часы.',
  },
]

export default function CasesPage() {
  return (
    <>
      <Helmet>
        <title>Кейсы клиентов: переход на Pini Kay | Брикет-Бери</title>
        <meta
          name="description"
          content="Кейсы ресторанов и кафе: снижение расхода, меньше дыма, стабильная температура при работе на брикетах Pini Kay."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={siteUrl('/cases')} />
        <meta property="og:title" content="Кейсы клиентов Брикет-Бери" />
        <meta property="og:description" content="Реальные результаты заведений после перехода на брикетный уголь Pini Kay." />
        <meta property="og:url" content={siteUrl('/cases')} />
      </Helmet>

      <div className="pt-28 pb-16 bg-[#0A0A0A]">
        <div className="container-custom max-w-5xl">
          <h1 className="section-title mb-4">Кейсы клиентов</h1>
          <p className="section-subtitle mb-10">
            Практические результаты перехода на брикетный уголь в заведениях HoReCa.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {cases.map((item) => (
              <article key={item.title} className="card p-6">
                <h2 className="text-white font-semibold mb-2">{item.title}</h2>
                <p className="text-brand-orange font-semibold mb-3">{item.result}</p>
                <p className="text-white/60 text-sm">{item.details}</p>
              </article>
            ))}
          </div>

          <div className="card p-6 mt-8">
            <h2 className="text-white font-semibold mb-3">Хотите такой же результат?</h2>
            <p className="text-white/60 text-sm mb-4">
              Рассчитаем объем закупки под вашу смену и подскажем, как перейти на Pini Kay без остановки кухни.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/comparison" className="btn-secondary">Сравнить с обычным углем</Link>
              <Link to="/order" className="btn-primary">Получить расчет</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
