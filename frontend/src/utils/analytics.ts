export function initYandexMetrika() {
  if (typeof window === 'undefined') return
  if ((window as unknown as { ym?: unknown }).ym) return

  const ymWindow = window as unknown as { ym?: (...args: unknown[]) => void; [key: string]: unknown }
  ymWindow.ym = function (...args: unknown[]) {
    const queueHost = ymWindow.ym as { a?: unknown[]; l?: number }
    queueHost.a = queueHost.a || []
    queueHost.a.push(args)
  }
  const queueHost = ymWindow.ym as { l?: number }
  queueHost.l = Date.now()

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://mc.yandex.ru/metrika/tag.js'
  document.head.appendChild(script)

  ymWindow.ym?.(108578678, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
    defer: true,
  })
}

