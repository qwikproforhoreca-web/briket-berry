import { Helmet } from 'react-helmet-async'
import { Link, Navigate, useParams } from 'react-router-dom'
import { blogPosts, getBlogPostBySlug } from '@/content/blogPosts'
import { SITE_URL, siteUrl } from '@/constants/site'

export default function BlogArticlePage() {
  const { slug } = useParams()
  const post = getBlogPostBySlug(slug)

  if (!post) return <Navigate to="/blog" replace />

  const postUrl = siteUrl(`/blog/${post.slug}`)

  return (
    <>
      <Helmet>
        <title>{post.title} | Брикет-Бери</title>
        <meta name="description" content={post.description} />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={postUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:url" content={postUrl} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.description,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          inLanguage: 'ru-RU',
          mainEntityOfPage: postUrl,
          author: {
            '@type': 'Organization',
            name: 'Брикет-Бери',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Брикет-Бери',
            logo: {
              '@type': 'ImageObject',
              url: `${SITE_URL}/logo.png`,
            },
          },
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Главная',
              item: siteUrl(),
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Блог',
              item: siteUrl('/blog'),
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: post.title,
              item: postUrl,
            },
          ],
        })}</script>
      </Helmet>

      <div className="pt-28 pb-16 bg-[#0A0A0A]">
        <div className="container-custom max-w-3xl">
          <Link to="/blog" className="text-brand-orange text-sm hover:underline">
            ← Вернуться в блог
          </Link>
          <h1 className="section-title mt-4 mb-4">{post.title}</h1>
          <p className="text-white/40 text-sm mb-8">
            Запрос: {post.targetQuery} · Время чтения: {post.readTime}
          </p>

          <article className="space-y-8">
            {post.sections.map((section) => (
              <section key={section.heading} className="card p-6">
                <h2 className="text-white text-xl font-semibold mb-3">{section.heading}</h2>
                <div className="space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-white/65 text-sm leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </article>

          {/* Automatic internal links for commercial conversion */}
          <div className="card p-6 mt-10">
            <h2 className="text-white font-semibold mb-3">Следующий шаг для внедрения</h2>
            <p className="text-white/60 text-sm mb-4">
              Получите расчет под ваш формат кухни: расход, стоимость смены и оптимальный график поставок.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn-secondary">Каталог продукции</Link>
              <Link to="/prices" className="btn-secondary">Цены и условия</Link>
              <Link to="/order" className="btn-primary">Оставить заявку</Link>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-white font-semibold mb-3">Другие статьи</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {blogPosts
                .filter((item) => item.slug !== post.slug)
                .slice(0, 4)
                .map((item) => (
                  <Link key={item.slug} to={`/blog/${item.slug}`} className="card p-4 hover:border-brand-orange/30 transition-colors">
                    <p className="text-white/80 text-sm">{item.title}</p>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
