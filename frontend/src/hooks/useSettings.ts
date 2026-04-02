import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface SiteSettings {
  phone: string
  whatsapp: string
  telegram: string
  max: string
  email: string
  address: string
}

const DEFAULTS: SiteSettings = {
  phone: '+7 (900) 000-00-00',
  whatsapp: '+79000000000',
  telegram: '@briket_beri',
  max: '+79000000000',
  email: 'info@briket-berry.ru',
  address: 'Москва · Пн–Пт 10:00 – 18:00',
}

export function useSettings() {
  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => axios.get('/api/v1/settings').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const map = (data as { key: string; value: string }[] | undefined)
    ?.reduce<Record<string, string>>((acc, s) => { acc[s.key] = s.value; return acc }, {}) ?? {}

  return {
    phone: map['site.phone'] || DEFAULTS.phone,
    whatsapp: map['site.whatsapp'] || DEFAULTS.whatsapp,
    telegram: map['site.telegram'] || DEFAULTS.telegram,
    max: map['site.max'] || DEFAULTS.max,
    email: map['site.email'] || DEFAULTS.email,
    address: map['site.address'] || DEFAULTS.address,
  }
}
