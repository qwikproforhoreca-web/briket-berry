import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Search, Download, Phone, Eye, Trash2, UserPlus, Pencil, Users, ClipboardList } from 'lucide-react'
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

const ESTABLISHMENT_OPTIONS = [
  { value: 'RESTAURANT', label: 'Ресторан' },
  { value: 'CAFE', label: 'Кафе' },
  { value: 'SHAWARMA', label: 'Шаурмичная' },
  { value: 'DELIVERY', label: 'Доставка' },
  { value: 'OTHER', label: 'Другое' },
] as const

type EstablishmentType = (typeof ESTABLISHMENT_OPTIONS)[number]['value']

interface CrmClient {
  id: string
  name: string
  phone: string
  email?: string | null
  establishment: string
  establishmentType: EstablishmentType
  city: string
  inn?: string | null
  organizationName?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

const emptyClientForm = {
  name: '',
  phone: '',
  email: '',
  establishment: '',
  establishmentType: 'RESTAURANT' as EstablishmentType,
  city: '',
  inn: '',
  organizationName: '',
  notes: '',
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'orders' | 'clients'>('orders')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const [clientPage, setClientPage] = useState(1)
  const [clientSearch, setClientSearch] = useState('')
  const [clientModal, setClientModal] = useState<'add' | 'edit' | null>(null)
  const [editingClient, setEditingClient] = useState<CrmClient | null>(null)
  const [clientForm, setClientForm] = useState(emptyClientForm)
  const [clientFormError, setClientFormError] = useState('')

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

  const { data: clientsPayload, isLoading: clientsLoading } = useQuery({
    queryKey: ['crm-clients', clientPage, clientSearch],
    queryFn: () =>
      axios
        .get(`/api/v1/clients?page=${clientPage}&limit=20&search=${encodeURIComponent(clientSearch)}`, {
          withCredentials: true,
        })
        .then((r) => r.data),
    enabled: tab === 'clients',
  })

  const saveClient = useMutation({
    mutationFn: async () => {
      setClientFormError('')
      const payload = {
        name: clientForm.name.trim(),
        phone: clientForm.phone.trim(),
        email: clientForm.email.trim() || undefined,
        establishment: clientForm.establishment.trim(),
        establishmentType: clientForm.establishmentType,
        city: clientForm.city.trim(),
        inn: clientForm.inn.trim() || undefined,
        organizationName: clientForm.organizationName.trim() || undefined,
        notes: clientForm.notes.trim() || undefined,
      }
      if (clientModal === 'add') {
        await axios.post('/api/v1/clients', payload, { withCredentials: true })
      } else if (editingClient) {
        await axios.patch(`/api/v1/clients/${editingClient.id}`, payload, { withCredentials: true })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-clients'] })
      setClientModal(null)
      setEditingClient(null)
      setClientForm(emptyClientForm)
    },
    onError: (err: unknown) => {
      const ax = err as { response?: { data?: { error?: { message?: string; code?: string } } } }
      const msg = ax.response?.data?.error?.message || 'Не удалось сохранить'
      setClientFormError(msg)
    },
  })

  const deleteClient = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/v1/clients/${id}`, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-clients'] })
      setClientModal(null)
      setEditingClient(null)
    },
  })

  const openAddClient = () => {
    setClientForm(emptyClientForm)
    setClientFormError('')
    setEditingClient(null)
    setClientModal('add')
  }

  const openEditClient = (c: CrmClient) => {
    setEditingClient(c)
    setClientForm({
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      establishment: c.establishment,
      establishmentType: c.establishmentType,
      city: c.city,
      inn: c.inn || '',
      organizationName: c.organizationName || '',
      notes: c.notes || '',
    })
    setClientFormError('')
    setClientModal('edit')
  }

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
  const clients = (clientsPayload?.data || []) as CrmClient[]
  const clientsMeta = clientsPayload?.meta

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Заявки и клиенты</h1>
          <p className="text-white/40 text-sm">Заявки с сайта и база контактов для менеджеров</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-white/10 p-0.5 bg-[#111]">
            <button
              type="button"
              onClick={() => setTab('orders')}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === 'orders' ? 'bg-brand-orange text-white' : 'text-white/50 hover:text-white',
              )}
            >
              <ClipboardList className="w-4 h-4" />
              Заявки
            </button>
            <button
              type="button"
              onClick={() => setTab('clients')}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === 'clients' ? 'bg-brand-orange text-white' : 'text-white/50 hover:text-white',
              )}
            >
              <Users className="w-4 h-4" />
              Клиенты
            </button>
          </div>
          {tab === 'orders' && (
            <>
              <button type="button" onClick={openAddClient} className="btn-primary py-2.5 px-4 text-sm gap-2">
                <UserPlus className="w-4 h-4" />
                Добавить клиента
              </button>
              <button type="button" onClick={exportCsv} className="btn-secondary py-2.5 px-4 text-sm gap-2">
                <Download className="w-4 h-4" />
                Экспорт CSV
              </button>
            </>
          )}
          {tab === 'clients' && (
            <button type="button" onClick={openAddClient} className="btn-primary py-2.5 px-4 text-sm gap-2">
              <UserPlus className="w-4 h-4" />
              Добавить клиента
            </button>
          )}
        </div>
      </div>

      {tab === 'orders' && (
      <>
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
      </>
      )}

      {tab === 'clients' && (
        <>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value)
                  setClientPage(1)
                }}
                placeholder="Поиск по имени, телефону, заведению..."
                className="input-field pl-9 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-white/5 bg-[#0D0D0D]">
                    {['Клиент', 'Телефон', 'Заведение', 'Город', 'Тип', 'Обновлён', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-white/30 text-xs font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clientsLoading && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-white/30 text-sm">
                        Загрузка...
                      </td>
                    </tr>
                  )}
                  {!clientsLoading &&
                    clients.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="text-white text-sm font-medium">{c.name}</div>
                          {c.email && <div className="text-white/35 text-xs truncate max-w-[200px]">{c.email}</div>}
                        </td>
                        <td className="px-4 py-3 text-brand-orange text-sm font-mono whitespace-nowrap">{c.phone}</td>
                        <td className="px-4 py-3 text-white/60 text-sm max-w-[160px] truncate">{c.establishment}</td>
                        <td className="px-4 py-3 text-white/50 text-sm whitespace-nowrap">{c.city}</td>
                        <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                          {ESTABLISHMENT_OPTIONS.find((o) => o.value === c.establishmentType)?.label || c.establishmentType}
                        </td>
                        <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">
                          {c.updatedAt ? format(new Date(c.updatedAt), 'd MMM yyyy', { locale: ru }) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <a
                              href={`https://wa.me/${c.phone?.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-green-400/50 hover:text-green-400 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => openEditClient(c)}
                              className="p-1.5 text-white/30 hover:text-white transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Удалить клиента «${c.name}» из базы?`)) deleteClient.mutate(c.id)
                              }}
                              className="p-1.5 text-red-400/50 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {!clientsLoading && clients.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-white/30 text-sm">
                        Клиентов пока нет. Нажмите «Добавить клиента» или импортируйте контакты вручную.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {clientsMeta && clientsMeta.totalPages > 1 && (
              <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm">
                <span className="text-white/40 text-xs">
                  {(clientPage - 1) * 20 + 1}–{Math.min(clientPage * 20, clientsMeta.total)} из {clientsMeta.total}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setClientPage((p) => p - 1)}
                    disabled={clientPage === 1}
                    className="px-3 py-1.5 text-white/60 hover:text-white disabled:opacity-30 border border-white/10 rounded-lg text-xs transition-colors"
                  >
                    ← Назад
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientPage((p) => p + 1)}
                    disabled={clientPage >= clientsMeta.totalPages}
                    className="px-3 py-1.5 text-white/60 hover:text-white disabled:opacity-30 border border-white/10 rounded-lg text-xs transition-colors"
                  >
                    Вперёд →
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

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

      {/* Client add/edit modal */}
      {clientModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !saveClient.isPending && setClientModal(null)}
        >
          <div
            className="card max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-white/5 flex justify-between items-start gap-4">
              <h2 className="font-bold text-white text-lg">
                {clientModal === 'add' ? 'Новый клиент' : 'Редактирование клиента'}
              </h2>
              <button
                type="button"
                disabled={saveClient.isPending}
                onClick={() => setClientModal(null)}
                className="text-white/40 hover:text-white shrink-0"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              {clientFormError && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {clientFormError}
                </p>
              )}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Имя контакта *</label>
                <input
                  className="input-field text-sm"
                  value={clientForm.name}
                  onChange={(e) => setClientForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Иван Иванов"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Телефон *</label>
                <input
                  className="input-field text-sm font-mono"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+7 900 000-00-00"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Email</label>
                <input
                  type="email"
                  className="input-field text-sm"
                  value={clientForm.email}
                  onChange={(e) => setClientForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="opt@company.ru"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Заведение *</label>
                <input
                  className="input-field text-sm"
                  value={clientForm.establishment}
                  onChange={(e) => setClientForm((f) => ({ ...f, establishment: e.target.value }))}
                  placeholder="Ресторан «Пример»"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Тип заведения *</label>
                <select
                  className="input-field text-sm"
                  value={clientForm.establishmentType}
                  onChange={(e) =>
                    setClientForm((f) => ({ ...f, establishmentType: e.target.value as EstablishmentType }))
                  }
                >
                  {ESTABLISHMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Город *</label>
                <input
                  className="input-field text-sm"
                  value={clientForm.city}
                  onChange={(e) => setClientForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Москва"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">ИНН</label>
                <input
                  className="input-field text-sm"
                  value={clientForm.inn}
                  onChange={(e) => setClientForm((f) => ({ ...f, inn: e.target.value }))}
                  placeholder="Для юрлиц"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Организация</label>
                <input
                  className="input-field text-sm"
                  value={clientForm.organizationName}
                  onChange={(e) => setClientForm((f) => ({ ...f, organizationName: e.target.value }))}
                  placeholder='ООО «…»'
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Заметка (только в админке)</label>
                <textarea
                  className="input-field text-sm resize-none min-h-[88px]"
                  value={clientForm.notes}
                  onChange={(e) => setClientForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="История звонков, пожелания..."
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  disabled={saveClient.isPending}
                  onClick={() => setClientModal(null)}
                  className="btn-secondary py-3 text-sm flex-1 justify-center"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  disabled={saveClient.isPending}
                  onClick={() => saveClient.mutate()}
                  className="btn-primary py-3 text-sm flex-1 justify-center"
                >
                  {saveClient.isPending ? 'Сохранение…' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
