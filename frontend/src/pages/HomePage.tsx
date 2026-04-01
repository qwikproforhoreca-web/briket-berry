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

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Угольные брикеты Pini Kay для ресторанов и кафе | Брикет-Бери</title>
        <meta
          name="description"
          content="Купить угольные брикеты Pini Kay оптом. 8 часов горения, без дыма и запаха, температура 900°C. Для ресторанов, кафе, хосперов. Цена от 750 ₽/кг"
        />
        <meta name="keywords" content="угольные брикеты, pini kay, уголь для ресторана, уголь для хоспера, брикеты для мангала оптом" />

        {/* Open Graph */}
        <meta property="og:title" content="Угольные брикеты Pini Kay — для профессиональной кухни" />
        <meta property="og:description" content="8 часов горения, без дыма и запаха. Брикеты Pini Kay для профессионалов. От 750 ₽/кг" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://briket-berry.ru" />
        <meta property="og:image" content="https://briket-berry.ru/og-image.jpg" />
        <meta property="og:locale" content="ru_RU" />

        {/* Schema.org */}
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Брикет-Бери',
          url: 'https://briket-berry.ru',
          logo: 'https://briket-berry.ru/logo.png',
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+7-900-000-00-00',
            contactType: 'sales',
            availableLanguage: 'Russian',
          },
          sameAs: [
            'https://wa.me/79000000000',
            'https://t.me/briket_berry',
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
