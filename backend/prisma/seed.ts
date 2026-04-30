import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 12)
  await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@charcoal-shop.ru' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@charcoal-shop.ru',
      password: hashedPassword,
      name: 'Администратор',
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Admin created')

  // Products
  const products = [
    {
      slug: 'pini-kay-10kg',
      name: 'Угольные брикеты Pini Kay',
      description: 'Профессиональные угольные брикеты для хосперов, мангалов и гриль-печей. Берёзовая древесина без химических добавок. Форма Pini Kay обеспечивает равномерное горение до 8 часов.',
      shortDesc: 'Брикеты 10 кг — для ресторанов и кафе',
      price: 890,
      priceWholesale: 750,
      wholesaleMinQty: 20,
      weight: 10,
      sku: 'PKB-10',
      inStock: true,
      featured: true,
      images: ['/images/pini-kay-10.jpg'],
      category: 'BRIQUETTES' as const,
      specs: {
        'Вес': '10 кг',
        'Форма': 'Шестигранник Pini Kay',
        'Время горения': 'До 8 часов',
        'Температура': '900°C+',
        'Зольность': '< 3%',
        'Влажность': '< 5%',
      },
      sortOrder: 1,
    },
    {
      slug: 'firestarters-8',
      name: 'Парафиновый розжиг',
      description: 'Натуральный парафиновый розжиг без запаха и токсинов. 8 кубиков в упаковке. Поджигает уголь за 5-7 минут. Экологически безопасный состав.',
      shortDesc: 'Розжиг 8 кубиков — натуральный парафин',
      price: 120,
      priceWholesale: 84,
      wholesaleMinQty: 50,
      weight: 0.1,
      sku: 'PFR-8',
      inStock: true,
      featured: false,
      images: ['/images/firestarters-8.jpg'],
      category: 'FIRESTARTERS' as const,
      specs: {
        'Количество': '8 кубиков',
        'Время горения': '10 минут / кубик',
        'Состав': 'Парафин + прессованные опилки',
        'Запах': 'Отсутствует',
        'Применение': 'Уголь, камин, самовар, котёл',
      },
      sortOrder: 3,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    })
  }
  console.log('✅ Products created')

  // Reviews
  const reviews = [
    {
      name: 'Магомед Алиев',
      position: 'Шеф-повар и совладелец',
      company: 'Ресторан «Бакинский дворик»',
      city: 'Москва',
      rating: 5,
      text: 'Работаю с Pini Kay уже 2 года — это лучший уголь для хоспера, который я пробовал. Главное преимущество — равномерный жар без провалов температуры. Стейки выходят идеально каждый раз. Один ящик 10 кг нам хватает на полный рабочий день хоспера. Рекомендую всем серьёзным заведениям.',
      photo: '/images/reviews/review-1.jpg',
      published: true,
      featured: true,
      verified: true,
      sortOrder: 1,
    },
    {
      name: 'Анна Соколова',
      position: 'Владелица',
      company: 'Кафе «Мангал House»',
      city: 'Санкт-Петербург',
      rating: 5,
      text: 'Перешли с обычного берёзового угля на Pini Kay 8 месяцев назад. Разница — как небо и земля. Кухня перестала дымить, экономия реальная. Парафиновый розжиг тоже берём у них — за 5 минут хоспер готов к работе.',
      photo: '/images/reviews/review-2.jpg',
      published: true,
      featured: true,
      verified: true,
      sortOrder: 2,
    },
    {
      name: 'Рустам Хасанов',
      position: 'Управляющий сетью',
      company: 'Шаурмичные «Восточный экспресс»',
      city: 'Казань',
      rating: 5,
      text: 'Управляю четырьмя точками шаурмы — везде стоят Pini Kay. Дымовых проблем больше нет. Соседи перестали жаловаться на дым — это было серьёзной проблемой в двух торговых центрах.',
      photo: '/images/reviews/review-3.jpg',
      published: true,
      featured: false,
      verified: true,
      sortOrder: 3,
    },
    {
      name: 'Дмитрий Павлов',
      position: 'Владелец',
      company: 'Стейк-хаус «Bravo Steaks»',
      city: 'Екатеринбург',
      rating: 5,
      text: 'Для стейк-хауса важна именно температура — 900°C — это не маркетинг, это реальность с Pini Kay. Тестировал пирометром. Корочка на стейке получается как в лучших ресторанах Москвы.',
      photo: '/images/reviews/review-4.jpg',
      published: true,
      featured: true,
      verified: true,
      sortOrder: 4,
    },
    {
      name: 'Лейла Гасанова',
      position: 'Владелица',
      company: 'Шаурмичная «Бейрут»',
      city: 'Москва',
      rating: 5,
      text: 'Открыла точку в торговом центре с жёсткими требованиями по вентиляции. С Pini Kay проблема решена — дыма нет вообще. Клиенты довольны, управление ТЦ довольно, я довольна.',
      photo: '/images/reviews/review-5.jpg',
      published: true,
      featured: false,
      verified: true,
      sortOrder: 5,
    },
    {
      name: 'Игорь Мельников',
      position: 'Шеф-повар',
      company: 'Ресторан «Огонь & Дым»',
      city: 'Новосибирск',
      rating: 5,
      text: 'Наш ресторан специализируется на блюдах на открытом огне. Pini Kay — лучший вариант из всех. Равномерный жар 6-8 часов без добавления. Никакого дыма в зале — это принципиально для open kitchen формата.',
      photo: '/images/reviews/review-6.jpg',
      published: true,
      featured: false,
      verified: true,
      sortOrder: 6,
    },
  ]

  for (const review of reviews) {
    await prisma.review.create({ data: review }).catch(() => {})
  }
  console.log('✅ Reviews created')

  // Settings
  const settings = [
    { key: 'site.name', value: 'Брикет-Бери', type: 'STRING', label: 'Название сайта', group: 'general' },
    { key: 'site.phone', value: '+7 (906) 490-22-48', type: 'STRING', label: 'Телефон', group: 'general' },
    { key: 'site.whatsapp', value: '+79064902248', type: 'STRING', label: 'WhatsApp', group: 'general' },
    { key: 'site.telegram', value: '@briket_beri', type: 'STRING', label: 'Telegram', group: 'general' },
    { key: 'site.email', value: 'bessonov@briket-berry.ru', type: 'STRING', label: 'Email', group: 'general' },
    { key: 'site.address', value: '355021, Ставропольский край, г. Ставрополь, ул. Родосская 1, кв. 166', type: 'STRING', label: 'Адрес / Часы работы', group: 'general' },
    { key: 'site.workingHours', value: 'Пн–Пт: 10:00 – 18:00', type: 'STRING', label: 'Часы работы', group: 'general' },
    { key: 'hero.videoUrl', value: '/videos/charcoal-bg.mp4', type: 'URL', label: 'Фоновое видео', group: 'video' },
    { key: 'tutorial.videoUrl', value: '/videos/tutorial.mp4', type: 'URL', label: 'Видео-инструкция', group: 'video' },
    { key: 'ai.enabled', value: 'true', type: 'BOOLEAN', label: 'ИИ включён', group: 'ai' },
    { key: 'ai.botName', value: 'Огонёк', type: 'STRING', label: 'Имя бота', group: 'ai' },
    { key: 'ai.model', value: 'deepseek-chat', type: 'STRING', label: 'Модель', group: 'ai' },
    { key: 'ai.systemPrompt', value: 'Ты — Огонёк, консультант компании Брикет-Бери. Продаём брикеты Pini Kay 10 кг и парафиновый розжиг 8 кубиков. Помогай ресторанам выбрать уголь, рассчитать расход и ответить на вопросы.', type: 'TEXT', label: 'Системный промпт', group: 'ai' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: { ...setting, type: setting.type as any },
    })
  }
  console.log('✅ Settings created')

  console.log('✅ Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
