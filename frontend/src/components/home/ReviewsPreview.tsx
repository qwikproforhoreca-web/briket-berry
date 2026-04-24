import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Star, ArrowRight, BadgeCheck } from 'lucide-react'

const featuredReviews = [
  {
    id: '1',
    name: 'Магомед Алиев',
    position: 'Шеф-повар',
    company: 'Ресторан «Бакинский дворик»',
    city: 'Москва',
    rating: 5,
    text: 'Работаю с Pini Kay уже 2 года — это лучший уголь для хоспера, который я пробовал. Равномерный жар без провалов температуры. Стейки выходят идеально каждый раз.',
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
    text: 'Перешли с обычного берёзового угля на Pini Kay 8 месяцев назад. Кухня перестала дымить, экономия реальная — закупаем в 3 раза меньше по весу.',
    photo: '/images/reviews/review-2.jpg',
    verified: true,
  },
  {
    id: '3',
    name: 'Дмитрий Павлов',
    position: 'Владелец',
    company: 'Стейк-хаус «Bravo Steaks»',
    city: 'Екатеринбург',
    rating: 5,
    text: 'Для стейк-хауса важна именно температура — 900°C реальность с Pini Kay. Тестировал пирометром. Корочка на стейке как в лучших ресторанах Москвы.',
    photo: '/images/reviews/review-4.jpg',
    verified: true,
  },
]

function ReviewCard({
  review,
  index,
}: {
  review: (typeof featuredReviews)[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      className="card-hover p-6 flex flex-col"
    >
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(review.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />
        ))}
      </div>

      {/* Text */}
      <p className="text-white/70 text-sm leading-relaxed mb-6 flex-1 italic">
        «{review.text}»
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-orange/30 to-brand-gold/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img
            src={review.photo}
            alt={review.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (!parent) return
              const fallback = document.createElement('span')
              fallback.className = 'text-brand-orange font-bold text-lg'
              fallback.textContent = review.name[0]
              parent.replaceChildren(fallback)
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white text-sm">{review.name}</span>
            {review.verified && (
              <BadgeCheck className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
            )}
          </div>
          <div className="text-white/40 text-xs truncate">
            {review.position} · {review.company}
          </div>
          <div className="text-white/30 text-xs">{review.city}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function ReviewsPreview() {
  return (
    <section className="section-padding bg-[#0A0A0A]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="fire-badge mb-4">⭐ Отзывы</div>
          <h2 className="section-title mb-4">
            Что говорят{' '}
            <span className="gradient-text">наши клиенты</span>
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Реальные отзывы владельцев и шеф-поваров ресторанов и кафе
          </p>
        </div>

        {/* Overall rating */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4 px-8 py-4 bg-[#111111] rounded-2xl border border-white/5">
            <div className="text-4xl font-display font-black gradient-text">5.0</div>
            <div>
              <div className="flex gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-brand-gold text-brand-gold" />
                ))}
              </div>
              <div className="text-white/40 text-sm">На основе 6 отзывов</div>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredReviews.map((review, i) => (
            <ReviewCard key={review.id} review={review} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link to="/reviews" className="btn-ghost text-brand-orange font-semibold">
            Все отзывы клиентов
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
