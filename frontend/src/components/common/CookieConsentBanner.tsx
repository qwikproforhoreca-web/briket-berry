import { Link } from 'react-router-dom'
import { useState } from 'react'
import { setAnalyticsConsent, ANALYTICS_CONSENT_KEY } from '@/utils/consent'

type Props = {
  onAccept: () => void
}

export default function CookieConsentBanner({ onAccept }: Props) {
  const [visible, setVisible] = useState(() => !localStorage.getItem(ANALYTICS_CONSENT_KEY))

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[120]">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#0E0E0E]/95 p-4 shadow-2xl backdrop-blur">
        <p className="text-white/80 text-sm leading-relaxed">
          Мы используем cookie и Яндекс.Метрику для аналитики посещаемости. Аналитические cookie
          включаются только после вашего согласия. Подробнее — в{' '}
          <Link to="/privacy" className="text-brand-orange hover:underline">
            Политике конфиденциальности
          </Link>
          {' '}и{' '}
          <Link to="/consent" className="text-brand-orange hover:underline">
            Согласии на обработку персональных данных
          </Link>
          .
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            onClick={() => {
              setAnalyticsConsent('accepted')
              setVisible(false)
              onAccept()
            }}
          >
            Принять
          </button>
          <button
            type="button"
            className="btn-secondary px-4 py-2 text-sm"
            onClick={() => {
              setAnalyticsConsent('declined')
              setVisible(false)
            }}
          >
            Только обязательные
          </button>
        </div>
      </div>
    </div>
  )
}

