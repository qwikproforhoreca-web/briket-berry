import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, Package, Star, Settings, LogOut } from 'lucide-react'
import axios from 'axios'
import FlameLogo from '@/components/ui/Flamelogo'

const navItems = [
  { to: '/admin', label: 'Дашборд', icon: LayoutDashboard, exact: true },
  { to: '/admin/orders', label: 'Заявки', icon: ShoppingBag },
  { to: '/admin/products', label: 'Продукты', icon: Package },
  { to: '/admin/reviews', label: 'Отзывы', icon: Star },
  { to: '/admin/settings', label: 'Настройки', icon: Settings },
]

export default function AdminSidebar() {
  const navigate = useNavigate()

  const logout = async () => {
    try {
      await axios.post('/api/v1/admin/logout', {}, { withCredentials: true })
    } finally {
      navigate('/admin/login')
    }
  }

  return (
    <aside className="w-64 bg-[#0D0D0D] border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <FlameLogo size={34} withGlow={false} />
          <div>
            <div className="text-white font-bold text-sm">Брикет-Бери</div>
            <div className="text-white/30 text-xs">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `admin-sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={logout}
          className="admin-sidebar-item w-full text-red-400/70 hover:text-red-400 hover:bg-red-400/5"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Выйти</span>
        </button>
      </div>
    </aside>
  )
}
