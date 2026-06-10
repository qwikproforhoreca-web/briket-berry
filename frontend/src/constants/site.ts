/** Canonical public site origin (always www). */
export const SITE_URL = 'https://www.briket-berry.ru'

export function siteUrl(path = '/'): string {
  if (!path || path === '/') return `${SITE_URL}/`
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}
