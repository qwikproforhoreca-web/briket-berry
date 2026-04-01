# Задача 12: SEO оптимизация

## Статус: ✅ Выполнено

---

## Ключевые слова (семантическое ядро)

### Высокочастотные (HF)
- угольные брикеты
- брикеты для мангала
- уголь для хоспера
- pini kay
- пини кей уголь
- уголь для ресторана
- уголь для гриля

### Среднечастотные (MF)
- угольные брикеты купить оптом
- pini kay брикеты цена
- уголь для хоспера купить
- брикеты для мангала оптом
- угольные брикеты для ресторана
- pini kay уголь купить москва
- уголь для мангала без дыма
- берёзовые угольные брикеты

### Низкочастотные (LF)
- угольные брикеты pini kay 10 кг купить
- уголь для хоспера josper купить оптом
- брикеты угольные для ресторана оптом москва
- уголь бездымный для ресторана
- парафиновый розжиг для угля купить
- розжиг для угольного хоспера
- угольные брикеты для шаурмичной
- уголь для камадо купить

### По городам (геозависимые)
- угольные брикеты москва
- угольные брикеты санкт-петербург
- угольные брикеты екатеринбург
- уголь для ресторана казань
- брикеты для мангала краснодар

---

## Meta теги по страницам

### Главная `/`
```html
<title>Угольные брикеты Pini Kay — доставка для ресторанов и кафе | Charcoal Shop</title>
<meta name="description" content="Купить угольные брикеты Pini Kay оптом. 8 часов горения, без дыма и запаха, температура 900°C. Для ресторанов, кафе, хосперов. Доставка по России. Цена от 750 ₽/кг">
<meta name="keywords" content="угольные брикеты, pini kay, уголь для ресторана, уголь для хоспера, брикеты для мангала оптом">

<!-- Open Graph -->
<meta property="og:title" content="Угольные брикеты Pini Kay — для профессиональной кухни">
<meta property="og:description" content="8 часов горения, без дыма. Доставка по России. От 750 ₽/кг">
<meta property="og:image" content="https://charcoal-shop.ru/og-image.jpg">
<meta property="og:url" content="https://charcoal-shop.ru">
<meta property="og:type" content="website">
<meta property="og:locale" content="ru_RU">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
```

### Продукты `/products`
```html
<title>Купить угольные брикеты Pini Kay оптом | Charcoal Shop</title>
<meta name="description" content="Угольные брикеты Pini Kay для ресторанов и кафе. 10 кг от 750 ₽, 20 кг от 1350 ₽. Парафиновый розжиг. Опт от 10 ящиков. Доставка Москва и регионы">
```

### Как использовать `/how-to-use`
```html
<title>Как использовать угольные брикеты Pini Kay — инструкция | Charcoal Shop</title>
<meta name="description" content="Подробная инструкция по розжигу брикетов Pini Kay. Как правильно разжечь хоспер за 15 минут, поддерживать температуру 900°C, хранить брикеты">
```

### Сравнение `/comparison`
```html
<title>Pini Kay vs обычный уголь — сравнение для ресторанов | Charcoal Shop</title>
<meta name="description" content="Сравнение угольных брикетов Pini Kay с обычным берёзовым углём. Почему 1 кг брикетов = 7 кг угля, экономический расчёт для ресторана">
```

### Отзывы `/reviews`
```html
<title>Отзывы клиентов об угольных брикетах Pini Kay | Charcoal Shop</title>
<meta name="description" content="Реальные отзывы шеф-поваров и владельцев ресторанов о брикетах Pini Kay. 500+ довольных клиентов по всей России">
```

---

## Structured Data (Schema.org)

### Organization
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Charcoal Shop",
  "url": "https://charcoal-shop.ru",
  "logo": "https://charcoal-shop.ru/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+7-900-000-00-00",
    "contactType": "sales",
    "availableLanguage": "Russian"
  }
}
```

### Product
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Угольные брикеты Pini Kay 10 кг",
  "description": "Профессиональные угольные брикеты для ресторанов и кафе",
  "brand": { "@type": "Brand", "name": "Pini Kay" },
  "offers": {
    "@type": "Offer",
    "price": "890",
    "priceCurrency": "RUB",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "reviewCount": "6"
  }
}
```

### Review
```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "author": { "@type": "Person", "name": "Магомед Алиев" },
  "reviewRating": { "@type": "Rating", "ratingValue": "5" },
  "reviewBody": "...",
  "datePublished": "2026-03-15"
}
```

### BreadcrumbList
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Главная", "item": "/" },
    { "@type": "ListItem", "position": 2, "name": "Продукты", "item": "/products" }
  ]
}
```

### FAQ (для страницы How to Use)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Можно ли дозажигать брикеты?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Да, брикеты Pini Kay можно погасить и разжечь снова..."
      }
    }
  ]
}
```

---

## Технический SEO

### sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://charcoal-shop.ru/</loc><priority>1.0</priority></url>
  <url><loc>https://charcoal-shop.ru/products</loc><priority>0.9</priority></url>
  <url><loc>https://charcoal-shop.ru/how-to-use</loc><priority>0.8</priority></url>
  <url><loc>https://charcoal-shop.ru/comparison</loc><priority>0.7</priority></url>
  <url><loc>https://charcoal-shop.ru/reviews</loc><priority>0.7</priority></url>
  <url><loc>https://charcoal-shop.ru/order</loc><priority>0.8</priority></url>
</urlset>
```

### robots.txt
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://charcoal-shop.ru/sitemap.xml
```

### Производительность (Core Web Vitals)
- LCP < 2.5s (lazy loading images, preload hero video)
- FID < 100ms (минимизация JavaScript)
- CLS < 0.1 (фиксированные размеры изображений)
- Lighthouse score > 90

### Технические требования
- HTTPS (SSL сертификат)
- Canonical URLs
- Hreflang (ru)
- Mobile-first responsive
- Заголовки H1-H6 иерархия
- Alt теги для всех изображений
- Сжатие gzip/brotli
- Кэширование статики

---

## Чеклист выполнения

- [x] Meta теги для всех страниц
- [x] Open Graph теги
- [x] Schema.org разметка
- [x] sitemap.xml
- [x] robots.txt
- [x] Canonical URLs
- [x] Alt теги изображений
- [x] H1-H6 иерархия
- [x] Core Web Vitals оптимизация
