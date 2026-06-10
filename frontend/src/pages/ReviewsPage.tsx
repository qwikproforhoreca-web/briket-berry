import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Star, BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { siteUrl } from '@/constants/site'

const reviews = [
  {
    id: '1',
    name: 'Магомед Алиев',
    position: 'Шеф-повар и совладелец',
    company: 'Ресторан «Бакинский дворик»',
    city: 'Москва',
    rating: 5,
    text: 'Работаю с Pini Kay уже 2 года — это лучший уголь для хоспера, который я пробовал. Главное преимущество — равномерный жар без провалов температуры. Стейки выходят идеально каждый раз. Один ящик 10 кг нам хватает на полный рабочий день хоспера. Раньше тратили вдвое больше обычного угля. Рекомендую всем серьёзным заведениям.',
    date: 'Март 2026',
    photo: '/images/reviews/review-1.jpg',
    verified: true,
  },
  {
    id: '2',
    name: 'Анна Соколова',
    position: 'Владелица',
    company: 'Кафе «Мангал House»',
    city: 'Санкт-Петербург',
    rating: 5,
    text: 'Перешли с обычного берёзового угля на Pini Kay 8 месяцев назад. Разница — как небо и земля. Во-первых, кухня перестала дымить — гости больше не жалуются. Во-вторых, экономия реальная: закупаем в 3 раза меньше по весу. Повара счастливы — меньше возни с розжигом. Парафиновый розжиг тоже берём у них — за 5 минут хоспер готов к работе.',
    date: 'Февраль 2026',
    photo: '/images/reviews/review-2.jpg',
    verified: true,
  },
  {
    id: '3',
    name: 'Рустам Хасанов',
    position: 'Управляющий сетью',
    company: 'Шаурмичные «Восточный экспресс» (4 точки)',
    city: 'Казань',
    rating: 5,
    text: 'Управляю четырьмя точками шаурмы — везде стоят Pini Kay. До этого закупали обычный уголь оптом, постоянно были проблемы: то дымит, то мало жара, то мясо не пропекается равномерно. С Pini Kay эти проблемы исчезли. Плюс соседи перестали жаловаться на дым — это было серьёзной проблемой в двух торговых центрах.',
    date: 'Январь 2026',
    photo: '/images/reviews/review-3.jpg',
    verified: true,
  },
  {
    id: '4',
    name: 'Дмитрий Павлов',
    position: 'Владелец',
    company: 'Стейк-хаус «Bravo Steaks»',
    city: 'Екатеринбург',
    rating: 5,
    text: 'Для стейк-хауса важна именно температура — 900°C — это не маркетинг, это реальность с Pini Kay. Тестировал пирометром. Корочка на стейке получается как в лучших ресторанах Москвы. Гости заметили разницу сразу. Теперь в меню даже пишем: «Мясо на углях Pini Kay» — это стало нашим маркетинговым преимуществом.',
    date: 'Декабрь 2025',
    photo: '/images/reviews/review-4.jpg',
    verified: true,
  },
  {
    id: '5',
    name: 'Лейла Гасанова',
    position: 'Владелица',
    company: 'Шаурмичная «Бейрут»',
    city: 'Москва',
    rating: 5,
    text: 'Открыла точку шаурмы в торговом центре — там жёсткие требования по вентиляции и дыму. С обычным углём не прошла бы проверку. Перешла на Pini Kay — проблема решена полностью. Дыма нет вообще, запах минимальный. Ещё один плюс: мясо не подгорает, даже если отвлекаешься. Клиенты довольны, управление ТЦ довольно, я довольна.',
    date: 'Ноябрь 2025',
    photo: '/images/reviews/review-5.jpg',
    verified: true,
  },
  {
    id: '6',
    name: 'Игорь Мельников',
    position: 'Шеф-повар',
    company: 'Ресторан «Огонь & Дым»',
    city: 'Новосибирск',
    rating: 5,
    text: 'Наш ресторан специализируется на блюдах на открытом огне. Перепробовал всё — обычный уголь, дрова, другие брикеты. Pini Kay — лучший вариант из всех. Равномерный жар держится 6-8 часов без добавления. За вечер загружаю один раз — и на весь ужин хватает. Это огромная экономия времени. Плюс никакого дыма в зале — это принципиально для open kitchen формата.',
    date: 'Октябрь 2025',
    photo: '/images/reviews/review-6.jpg',
    verified: true,
  },
]

export default function ReviewsPage() {
  const totalRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

  return (
    <>
      <Helmet>
        <title>Отзывы клиентов об угольных брикетах Pini Kay | Брикет-Бери</title>
        <meta
          name="description"
          content="Реальные отзывы шеф-поваров и владельцев ресторанов о брикетах Pini Kay. 500+ довольных клиентов"
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={siteUrl('/reviews')} />
        <meta property="og:title" content="Отзывы о брикетах Pini Kay от ресторанов" />
        <meta property="og:description" content="Реальные кейсы и отзывы заведений по работе на брикетах Pini Kay." />
        <meta property="og:url" content={siteUrl('/reviews')} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Угольные брикеты Pini Kay',
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: totalRating.toFixed(1),
            reviewCount: reviews.length,
          },
          review: reviews.map(r => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.name },
            reviewRating: { '@type': 'Rating', ratingValue: r.rating },
            reviewBody: r.text,
            datePublished: r.date,
          })),
        })}</script>
      </Helmet>

      {/* Hero */}
      <div className="pt-28 pb-16 bg-[#0A0A0A]">
        <div className="container-custom text-center">
          <div className="fire-badge mb-4">⭐ Отзывы</div>
          <h1 className="section-title mb-4">
            Что говорят наши{' '}
            <span className="gradient-text">клиенты</span>
          </h1>
          <p className="section-subtitle max-w-xl mx-auto mb-10">
            Реальные отзывы владельцев и шеф-поваров ресторанов, кафе и шаурмичных
          </p>

          {/* Aggregate Rating */}
          <div className="inline-flex items-center gap-6 px-8 py-5 bg-[#111111] rounded-2xl border border-white/5">
            <div className="text-center">
              <div className="font-display font-black text-5xl gradient-text">{totalRating.toFixed(1)}</div>
              <div className="text-white/40 text-sm mt-1">из 5.0</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-brand-gold text-brand-gold" />
                ))}
              </div>
              <div className="text-white/60 text-sm">{reviews.length} отзывов от ресторанов</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="section-padding bg-[#0A0A0A]">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="card-hover p-6 flex flex-col"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-brand-gold text-brand-gold" />
                  ))}
                  <span className="text-white/20 text-xs ml-auto self-center">{review.date}</span>
                </div>

                {/* Text */}
                <p className="text-white/70 text-sm leading-relaxed mb-6 flex-1 italic">
                  «{review.text}»
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-brand-orange/20">
                    <img
                      src={review.photo}
                      alt={review.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const t = e.target as HTMLImageElement
                        t.style.display = 'none'
                        const parent = t.parentElement
                        if (!parent) return
                        const fallback = document.createElement('div')
                        fallback.className = 'w-full h-full flex items-center justify-center text-brand-orange font-bold text-xl'
                        fallback.textContent = review.name[0]
                        parent.replaceChildren(fallback)
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-white text-sm">{review.name}</span>
                      {review.verified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-white/40 text-xs">{review.position}</div>
                    <div className="text-white/30 text-xs truncate">{review.company} · {review.city}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16 p-12 bg-[#111111] rounded-3xl border border-white/5">
            <h2 className="font-display font-bold text-3xl text-white mb-4">
              Присоединяйтесь к 500+ довольных клиентов
            </h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              Оставьте заявку и мы рассчитаем оптимальный объём для вашего заведения
            </p>
            <Link to="/order" className="btn-primary">
              Оставить заявку
              <Star className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
