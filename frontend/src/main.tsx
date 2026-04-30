import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import axios from 'axios'
import App from './App.tsx'
import './styles/globals.css'
import { hasAnalyticsConsent } from '@/utils/consent'
import { initYandexMetrika } from '@/utils/analytics'

// В продакшене можно задать absolute API URL, либо оставить same-origin.
if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'same-origin') {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL
}

if (hasAnalyticsConsent()) {
  initYandexMetrika()
}

// Attach admin token from localStorage for cross-domain auth
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
)
