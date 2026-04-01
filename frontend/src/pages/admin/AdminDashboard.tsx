import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ShoppingBag, TrendingUp, Users, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface OrderRow {
  id: string
  orderNumber: string
  name: string
  phone: string
  establishment: string
  totalAmount: number
  status: string
  createdAt: string
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Новая', color: 'text-yellow-400' },
  PENDING_PAYMENT: { label: 'Ожидает оплаты', color: 'text-blue-400' },
  PAID: { label: 'Оплачено', color: 'text-green-400' },
  CONFIRMED: { label: 'Подтверждено', color: 'text-green-400' },
  CANCELLED: { label: 'Отменено', color: 'text-red-400' },
  DELIVERED: { label: 'Доставлено', color: 'text-green-500' },
  AWAITING_INVOICE: { label: 'Ожидает счёт', color: 'text-blue-300' },
}

function StatCard({ icon: Icon, label, value, change, color }: {
  icon: React.ElementType, label: string, value: string, change?: string, color: string
}) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change && (
          <span className="text-green-400 text-xs font-medium bg-green-400/10 px-2 py-1 rounded-full">
            {change}
          </span>
        )}
      </div>
      <div className="font-display font-bold text-2xl text-white mb-1">{value}</div>
      <div className="text-white/40 text-sm">{label}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => axios.get('/api/v1/admin/stats', { withCredentials: true }).then(r => r.data.data),
  })

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => axios.get('/api/v1/orders?limit=10&page=1', { withCredentials: true }).then(r => r.data.data),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Дашборд</h1>
        <p className="text-white/40 text-sm mt-1">Обзор работы магазина</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingBag}
          label="Заявок сегодня"
          value={stats?.todayOrders ?? '—'}
          change="+5%"
          color="bg-brand-orange"
        />
        <StatCard
          icon={DollarSign}
          label="Выручка (месяц)"
          value={stats?.monthRevenue ? `${Number(stats.monthRevenue).toLocaleString('ru')} ₽` : '—'}
          change="+12%"
          color="bg-green-600"
        />
        <StatCard
          icon={Users}
          label="Всего клиентов"
          value={stats?.totalClients ?? '—'}
          color="bg-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Конверсия"
          value={stats?.conversion ? `${stats.conversion}%` : '—'}
          color="bg-purple-600"
        />
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-semibold text-white">Последние заявки</h2>
          <a href="/admin/orders" className="text-brand-orange text-sm hover:underline">Все заявки →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['№ Заявки', 'Клиент', 'Заведение', 'Сумма', 'Статус', 'Дата'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-white/30 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map((order: OrderRow) => {
                const status = statusLabels[order.status] || { label: order.status, color: 'text-white/50' }
                return (
                  <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-brand-orange text-sm font-mono">#{order.orderNumber?.slice(-6)}</td>
                    <td className="px-4 py-3">
                      <div className="text-white text-sm">{order.name}</div>
                      <div className="text-white/30 text-xs">{order.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">{order.establishment}</td>
                    <td className="px-4 py-3 text-white font-semibold text-sm">{Number(order.totalAmount).toLocaleString('ru')} ₽</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3 text-white/30 text-xs">
                      {order.createdAt ? format(new Date(order.createdAt), 'd MMM HH:mm', { locale: ru }) : '—'}
                    </td>
                  </tr>
                )
              })}
              {!recentOrders?.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/30 text-sm">
                    Заявок пока нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
