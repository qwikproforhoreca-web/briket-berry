import { ExternalLink, Bell } from 'lucide-react'

export default function AdminHeader() {
  return (
    <header className="h-14 bg-[#0D0D0D] border-b border-white/5 flex items-center justify-between px-6">
      <div className="text-white/50 text-sm">
        Панель управления
      </div>
      <div className="flex items-center gap-4">
        <button className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5">
          <Bell className="w-4 h-4" />
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-white/40 hover:text-brand-orange text-xs transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Открыть сайт
        </a>
      </div>
    </header>
  )
}
