import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from '@/components/layout/Layout'
import AdminLayout from '@/components/admin/AdminLayout'
import LoadingScreen from '@/components/ui/LoadingScreen'
import AiChatWidget from '@/components/ai/AiChatWidget'

const HomePage = lazy(() => import('@/pages/HomePage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const FirestartersPage = lazy(() => import('@/pages/FirestartersPage'))
const HowToUsePage = lazy(() => import('@/pages/HowToUsePage'))
const ComparisonPage = lazy(() => import('@/pages/ComparisonPage'))
const ReviewsPage = lazy(() => import('@/pages/ReviewsPage'))
const OrderPage = lazy(() => import('@/pages/OrderPage'))
const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccessPage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'))
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'))
const AdminReviewsPage = lazy(() => import('@/pages/admin/AdminReviewsPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export default function App() {
  const { pathname } = useLocation()
  const showAiWidget = !pathname.startsWith('/admin')

  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/firestarters" element={<FirestartersPage />} />
            <Route path="/how-to-use" element={<HowToUsePage />} />
            <Route path="/comparison" element={<ComparisonPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/order/success" element={<OrderSuccessPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Redirects & 404 */}
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {showAiWidget && <AiChatWidget />}
    </>
  )
}
