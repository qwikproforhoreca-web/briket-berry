import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Plus, Edit2, Trash2, Eye, EyeOff, Star } from 'lucide-react'
import clsx from 'clsx'

interface Review {
  id: string
  authorName: string
  authorTitle?: string
  authorPhoto?: string
  rating: number
  text: string
  published: boolean
  featured: boolean
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => axios.get('/api/v1/reviews/all', { withCredentials: true }).then(r => r.data.data),
  })

  const togglePublish = useMutation({
    mutationFn: (review: Review) =>
      axios.patch(`/api/v1/reviews/${review.id}/publish`, { published: !review.published }, { withCredentials: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
  })

  const deleteReview = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`/api/v1/reviews/${id}`, { withCredentials: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
  })

  const reviews = data || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Отзывы</h1>
          <p className="text-white/40 text-sm">Управление отзывами клиентов</p>
        </div>
        <button className="btn-primary py-2.5 px-4 text-sm">
          <Plus className="w-4 h-4" />
          Добавить отзыв
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-[#0D0D0D]">
              {['Автор', 'Рейтинг', 'Текст', 'Опубликован', 'Featured', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-white/30 text-xs font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reviews.map((review: Review) => (
              <tr key={review.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange font-bold text-sm flex-shrink-0 overflow-hidden">
                      {review.photo
                        ? <img src={review.photo} alt={review.name} className="w-full h-full object-cover" />
                        : review.name?.[0]
                      }
                    </div>
                    <div>
                      <div className="text-white text-sm">{review.name}</div>
                      <div className="text-white/30 text-xs">{review.company} · {review.city}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={clsx('w-3.5 h-3.5', i < review.rating ? 'fill-brand-gold text-brand-gold' : 'text-white/10')}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 max-w-[200px]">
                  <p className="text-white/50 text-xs truncate">{review.text}</p>
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => togglePublish.mutate(review)}
                    className={clsx(
                      'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border transition-colors',
                      review.published
                        ? 'text-green-400 border-green-400/20 hover:bg-green-400/5'
                        : 'text-white/30 border-white/10 hover:bg-white/5'
                    )}
                  >
                    {review.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {review.published ? 'Видим' : 'Скрыт'}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <span className={clsx('text-xs', review.featured ? 'text-brand-gold' : 'text-white/20')}>
                    {review.featured ? '⭐ Featured' : '—'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <button className="p-1.5 text-white/30 hover:text-white transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => confirm('Удалить отзыв?') && deleteReview.mutate(review.id)}
                      className="p-1.5 text-red-400/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!reviews.length && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-white/30 text-sm">Отзывов нет</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
