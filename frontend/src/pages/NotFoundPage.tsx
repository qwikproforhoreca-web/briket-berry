import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Flame, Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Страница не найдена | Брикет-Бери</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-center px-4">
        <div>
          <Flame className="w-16 h-16 text-brand-orange mx-auto mb-6 opacity-50" />
          <h1 className="font-display font-black text-8xl text-white/10 mb-4">404</h1>
          <h2 className="font-display font-bold text-2xl text-white mb-3">Страница не найдена</h2>
          <p className="text-white/40 mb-8">Эта страница сгорела или никогда не существовала</p>
          <Link to="/" className="btn-primary">
            <Home className="w-4 h-4" />
            На главную
          </Link>
        </div>
      </div>
    </>
  )
}
