import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { LEGAL_ADDRESS, LEGAL_EMAIL, LEGAL_PHONE, LEGAL_PHONE_DIGITS } from '@/constants/legal'

interface SiteSettings {
  phone: string
  whatsapp: string
  telegram: string
  max: string
  email: string
  address: string
}

const DEFAULTS: SiteSettings = {
  phone: LEGAL_PHONE,
  whatsapp: `+${LEGAL_PHONE_DIGITS}`,
  telegram: '@briket_beri',
  max: `+${LEGAL_PHONE_DIGITS}`,
  email: LEGAL_EMAIL,
  address: LEGAL_ADDRESS,
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
    phone: DEFAULTS.phone,
    whatsapp: map['site.whatsapp'] || DEFAULTS.whatsapp,
    telegram: map['site.telegram'] || DEFAULTS.telegram,
    max: map['site.max'] || DEFAULTS.max,
    email: DEFAULTS.email,
    address: DEFAULTS.address,
  }
}
