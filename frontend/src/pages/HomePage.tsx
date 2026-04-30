import { Helmet } from 'react-helmet-async'
import HeroSection from '@/components/home/HeroSection'
import TrustBar from '@/components/home/TrustBar'
import StatsSection from '@/components/home/StatsSection'
import BenefitsSection from '@/components/home/BenefitsSection'
import ProductsPreview from '@/components/home/ProductsPreview'
import ComparisonPreview from '@/components/home/ComparisonPreview'
import HowToStart from '@/components/home/HowToStart'
import ReviewsPreview from '@/components/home/ReviewsPreview'
import CtaSection from '@/components/home/CtaSection'
import { LEGAL_PHONE_DIGITS } from '@/constants/legal'

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Угольные брикеты Pini Kay для ресторанов и кафе | Брикет-Бери</title>
        <meta
          name="description"
          content="Купить угольные брикеты Pini Kay оптом. до 8 часов горения, без дыма и запаха, температура 900°C. Для ресторанов, кафе, хосперов. Опт от 10 коробок — 835 ₽, розжиг опт от 20 — 100 ₽"
        />
        <meta name="keywords" content="угольные брикеты, pini kay, уголь для ресторана, уголь для хоспера, брикеты для мангала оптом" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://briket-berry.ru/" />

        {/* Open Graph */}
        <meta property="og:title" content="Угольные брикеты Pini Kay — для профессиональной кухни" />
        <meta property="og:description" content="До 8 часов горения, без дыма и запаха. Опт от 10 коробок — 835 ₽" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://briket-berry.ru" />
        <meta property="og:image" content="https://briket-berry.ru/og-image.jpg" />
        <meta property="og:image:alt" content="Угольные брикеты Pini Kay оптом для ресторанов и хосперов" />
        <meta property="og:locale" content="ru_RU" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Угольные брикеты Pini Kay — для профессиональной кухни" />
        <meta name="twitter:description" content="До 8 часов горения, без дыма и запаха. Опт от 10 коробок — 835 ₽" />
        <meta name="twitter:image" content="https://briket-berry.ru/og-image.jpg" />

        {/* Schema.org */}
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': 'https://briket-berry.ru/#organization',
              name: 'Брикет-Бери',
              url: 'https://briket-berry.ru',
              logo: 'https://briket-berry.ru/logo.png',
              areaServed: 'RU',
              sameAs: [
                `https://wa.me/${LEGAL_PHONE_DIGITS}`,
                'https://t.me/briket_berry',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+7-906-490-22-48',
                contactType: 'sales',
                availableLanguage: ['ru'],
              },
            },
            {
              '@type': 'LocalBusiness',
              '@id': 'https://briket-berry.ru/#localbusiness',
              name: 'Брикет-Бери',
              url: 'https://briket-berry.ru',
              image: 'https://briket-berry.ru/og-image.jpg',
              priceRange: '₽₽',
              areaServed: ['Москва', 'Санкт-Петербург', 'Россия'],
              telephone: '+7-906-490-22-48',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'RU',
              },
            },
            {
              '@type': 'WebSite',
              '@id': 'https://briket-berry.ru/#website',
              url: 'https://briket-berry.ru',
              name: 'Брикет-Бери',
              inLanguage: 'ru-RU',
            },
          ],
        })}</script>
      </Helmet>

      <HeroSection />
      <TrustBar />
      <StatsSection />
      <BenefitsSection />
      <ProductsPreview />
      <ComparisonPreview />
      <HowToStart />
      <ReviewsPreview />
      <CtaSection />
    </>
  )
}
