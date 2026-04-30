export const ANALYTICS_CONSENT_KEY = 'analytics_consent_v1'

export function hasAnalyticsConsent() {
  return localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'accepted'
}

export function setAnalyticsConsent(value: 'accepted' | 'declined') {
  localStorage.setItem(ANALYTICS_CONSENT_KEY, value)
}

