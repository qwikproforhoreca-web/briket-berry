import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Search, Download, Phone, Eye, Trash2 } from 'lucide-react'
import clsx from 'clsx'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  subtotal: number
  product?: { name: string; sku: string }
}

interface Order {
  id: string
  orderNumber: string
  name: string
  phone: string
  email?: string
  establishment: string
  city: string
  status: string
  paymentMethod: string
  totalAmount: number
  discountAmount: number
  comment?: string
  createdAt: string
  items?: OrderItem[]
}

const STATUS_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: 'PENDING', label: 'Новые', color: 'text-yellow-400' },
  { value: 'CONFIRMED', label: 'Подтверждены', color: 'text-green-400' },
  { value: 'PAID', label: 'Оплачены', color: 'text-green-500' },
  { value: 'DELIVERED', label: 'Доставлены', color: 'text-blue-400' },
  { value: 'CANCELLED', label: 'Отменены', color: 'text-red-400' },
]

export default function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, search, statusFilter],
    queryFn: () =>
      axios.get(`/api/v1/orders?page=${page}&limit=20&search=${search}&status=${statusFilter}`, {
        withCredentials: true,
      }).then((r) => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      axios.patch(`/api/v1/orders/${id}/status`, { status }, { withCredentials: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })

  const deleteOrder = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`/api/v1/orders/${id}`, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setSelectedOrder(null)
    },
  })

  const exportCsv = async () => {
    const res = await axios.get('/api/v1/orders/export', {
      withCredentials: true,
      responseType: 'blob',
    })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  const orders = data?.data || []
  const meta = data?.meta

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Заявки</h1>
          <p className="text-white/40 text-sm">Управление заявками от клиентов</p>
        </div>
        <button onClick={exportCsv} className="btn-secondary py-2.5 px-4 text-sm gap-2">
          <Download className="w-4 h-4" />
          Экспорт CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Поиск по имени, телефону..."
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="input-field py-2.5 text-sm min-w-[160px]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-[#0D0D0D]">
                {['№', 'Клиент', 'Заведение', 'Город', 'Сумма', 'Оплата', 'Статус', 'Дата', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-white/30 text-xs font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-white/30 text-sm">Загрузка...</td></tr>
              )}
              {orders.map((order: Order) => {
                const status = STATUS_OPTIONS.find(s => s.value === order.status)
                return (
                  <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-brand-orange text-sm font-mono whitespace-nowrap">
                      #{order.orderNumber?.slice(-6)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white text-sm whitespace-nowrap">{order.name}</div>
                      <div className="text-white/30 text-xs">{order.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm max-w-[150px] truncate">{order.establishment}</td>
                    <td className="px-4 py-3 text-white/50 text-sm whitespace-nowrap">{order.city}</td>
                    <td className="px-4 py-3 text-white font-semibold text-sm whitespace-nowrap">
                      {Number(order.totalAmount || 0).toLocaleString('ru')} ₽
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white/40 text-xs">
                        {order.paymentMethod === 'ONLINE' ? '💳' : '📄'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })}
                        className={clsx(
                          'bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer',
                          status?.color || 'text-white/60'
                        )}
                      >
                        {STATUS_OPTIONS.filter(s => s.value).map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-[#1A1A1A] text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">
                      {order.createdAt ? format(new Date(order.createdAt), 'd MMM HH:mm', { locale: ru }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-white/30 hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`https://wa.me/${order.phone?.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-green-400/50 hover:text-green-400 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!isLoading && orders.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-white/30 text-sm">Заявок не найдено</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm">
            <span className="text-white/40 text-xs">
              {(page - 1) * 20 + 1}–{Math.min(page * 20, meta.total)} из {meta.total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 text-white/60 hover:text-white disabled:opacity-30 border border-white/10 rounded-lg text-xs transition-colors"
              >← Назад</button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= meta.totalPages}
                className="px-3 py-1.5 text-white/60 hover:text-white disabled:opacity-30 border border-white/10 rounded-lg text-xs transition-colors"
              >Вперёд →</button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="card max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/5 flex justify-between items-start">
              <div>
                <h2 className="font-bold text-white text-lg">Заявка #{selectedOrder.orderNumber?.slice(-6)}</h2>
                <p className="text-white/40 text-sm">{format(new Date(selectedOrder.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru })}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-white/40 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-white/40 text-xs uppercase tracking-wide mb-2">Клиент</h3>
                <p className="text-white font-medium">{selectedOrder.name}</p>
                <p className="text-brand-orange text-sm">{selectedOrder.phone}</p>
                {selectedOrder.email && <p className="text-white/50 text-sm">{selectedOrder.email}</p>}
              </div>
              <div>
                <h3 className="text-white/40 text-xs uppercase tracking-wide mb-2">Заведение</h3>
                <p className="text-white">{selectedOrder.establishment}</p>
                <p className="text-white/50 text-sm">{selectedOrder.city}</p>
              </div>
              {selectedOrder.comment && (
                <div>
                  <h3 className="text-white/40 text-xs uppercase tracking-wide mb-2">Комментарий</h3>
                  <p className="text-white/70 text-sm">{selectedOrder.comment}</p>
                </div>
              )}
              <div>
                <h3 className="text-white/40 text-xs uppercase tracking-wide mb-2">Сумма</h3>
                <p className="font-display font-bold text-xl gradient-text">{Number(selectedOrder.totalAmount).toLocaleString('ru')} ₽</p>
              </div>
              <div className="flex gap-3 pt-2">
                <a
                  href={`https://wa.me/${selectedOrder.phone?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary py-2.5 flex-1 text-sm justify-center"
                >
                  WhatsApp
                </a>
                <button
                  onClick={() => {
                    if (confirm('Удалить заявку?')) deleteOrder.mutate(selectedOrder.id)
                  }}
                  className="p-2.5 text-red-400/60 hover:text-red-400 transition-colors border border-red-400/20 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
