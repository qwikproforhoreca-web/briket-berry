import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { blogPosts } from '@/content/blogPosts'

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title>Блог о брикетном угле и хосперах | Брикет-Бери</title>
        <meta
          name="description"
          content="Экспертный блог Брикет-Бери: выбор брикетного угля, работа с хоспером, снижение расхода и дымности на кухне."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://briket-berry.ru/blog" />
        <meta property="og:title" content="Блог Брикет-Бери" />
        <meta property="og:description" content="Статьи по выбору и применению брикетного угля для HoReCa." />
        <meta property="og:url" content="https://briket-berry.ru/blog" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Блог Брикет-Бери',
          url: 'https://briket-berry.ru/blog',
          inLanguage: 'ru-RU',
        })}</script>
      </Helmet>

      <div className="pt-28 pb-16 bg-[#0A0A0A]">
        <div className="container-custom max-w-5xl">
          <h1 className="section-title mb-4">Блог</h1>
          <p className="section-subtitle mb-10">
            Материалы для владельцев и шефов: как повысить стабильность кухни на углях и сократить расход топлива.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <article key={post.slug} className="card p-6">
                <h2 className="text-white font-semibold mb-3">{post.title}</h2>
                <p className="text-white/60 text-sm mb-2">{post.description}</p>
                <p className="text-white/35 text-xs mb-4">Запрос: {post.targetQuery} · {post.readTime}</p>
                <Link to={`/blog/${post.slug}`} className="text-brand-orange text-sm hover:underline">
                  Читать статью
                </Link>
              </article>
            ))}
          </div>

          <div className="card p-6 mt-8">
            <h2 className="text-white font-semibold mb-3">Нужен материал под вашу задачу?</h2>
            <p className="text-white/60 text-sm mb-4">
              Напишите, и мы подготовим практический разбор под формат вашей кухни.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/faq" className="btn-secondary">Смотреть FAQ</Link>
              <Link to="/order" className="btn-primary">Оставить заявку</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
