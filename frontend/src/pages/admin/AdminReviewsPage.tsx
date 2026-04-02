import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, X } from 'lucide-react'
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
  const [showForm, setShowForm] = useState(false)
  const [formAuthorName, setFormAuthorName] = useState('')
  const [formAuthorTitle, setFormAuthorTitle] = useState('')
  const [formRating, setFormRating] = useState(5)
  const [formText, setFormText] = useState('')
  const [formPublished, setFormPublished] = useState(false)

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

  const createReview = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      axios.post('/api/v1/reviews', data, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      resetForm()
    },
  })

  function resetForm() {
    setShowForm(false)
    setFormAuthorName('')
    setFormAuthorTitle('')
    setFormRating(5)
    setFormText('')
    setFormPublished(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createReview.mutate({
      authorName: formAuthorName,
      authorTitle: formAuthorTitle,
      rating: formRating,
      text: formText,
      published: formPublished,
    })
  }

  const reviews = data || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Отзывы</h1>
          <p className="text-white/40 text-sm">Управление отзывами клиентов</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary py-2.5 px-4 text-sm">
          <Plus className="w-4 h-4" />
          Добавить отзыв
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4 bg-[#111111] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-medium text-sm">Новый отзыв</h2>
            <button type="button" onClick={resetForm} className="p-1 text-white/30 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-white/40 text-xs">Имя автора</label>
              <input value={formAuthorName} onChange={(e) => setFormAuthorName(e.target.value)} required
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20" placeholder="Иван Петров" />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/40 text-xs">Компания / Город</label>
              <input value={formAuthorTitle} onChange={(e) => setFormAuthorTitle(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20" placeholder="ООО Ресторан, Москва" />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/40 text-xs">Рейтинг</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setFormRating(n)}
                    className={clsx('p-1 transition-colors', n <= formRating ? 'text-brand-gold' : 'text-white/10 hover:text-white/30')}>
                    <Star className={clsx('w-5 h-5', n <= formRating && 'fill-brand-gold')} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5 flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formPublished} onChange={(e) => setFormPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-[#0D0D0D] accent-brand-orange" />
                <span className="text-white/40 text-xs">Опубликовать сразу</span>
              </label>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-white/40 text-xs">Текст отзыва</label>
            <textarea value={formText} onChange={(e) => setFormText(e.target.value)} required rows={3}
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 resize-none" placeholder="Текст отзыва..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-white/40 hover:text-white text-sm transition-colors">Отмена</button>
            <button type="submit" disabled={createReview.isPending} className="btn-primary py-2 px-5 text-sm">
              {createReview.isPending ? 'Сохранение...' : 'Создать отзыв'}
            </button>
          </div>
        </form>
      )}

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
                      {review.authorPhoto
                        ? <img src={review.authorPhoto} alt={review.authorName} className="w-full h-full object-cover" />
                        : review.authorName?.[0]
                      }
                    </div>
                    <div>
                      <div className="text-white text-sm">{review.authorName}</div>
                      <div className="text-white/30 text-xs">{review.authorTitle || ''}</div>
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
