import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'

interface Product {
  id: string
  name: string
  shortDesc?: string
  sku: string
  price: number
  priceWholesale?: number
  category: string
  weight?: number
  description?: string
  specs?: Record<string, string>
  featured?: boolean
  inStock: boolean
  images?: string[]
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [serverError, setServerError] = useState('')
  const [formName, setFormName] = useState('')
  const [formSku, setFormSku] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formWholesalePrice, setFormWholesalePrice] = useState('')
  const [formCategory, setFormCategory] = useState<'BRIQUETTES' | 'FIRESTARTERS'>('BRIQUETTES')
  const [formWeight, setFormWeight] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formShortDesc, setFormShortDesc] = useState('')
  // Quick specs for homepage cards (stored in `specs` JSON)
  const [specTime, setSpecTime] = useState('')
  const [specTemp, setSpecTemp] = useState('')
  const [specNoSmoke, setSpecNoSmoke] = useState('')
  const [specNoChem, setSpecNoChem] = useState('')
  const [specStarter, setSpecStarter] = useState('')
  const [formFeatured, setFormFeatured] = useState(false)
  const [formImageFiles, setFormImageFiles] = useState<File[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  const { data } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => axios.get('/api/v1/products', { withCredentials: true }).then(r => r.data.data),
  })

  const toggleStock = useMutation({
    mutationFn: (product: Product) =>
      axios.put(`/api/v1/products/${product.id}`, { inStock: !product.inStock }, { withCredentials: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  const deleteProduct = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`/api/v1/products/${id}`, { withCredentials: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  const createProduct = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      axios.post('/api/v1/products', data, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      resetForm()
    },
    onError: (e: unknown) => {
      const err = e as any
      setServerError(err?.response?.data?.error?.message || 'Ошибка при создании продукта')
    },
  })

  const seedDefaults = useMutation({
    mutationFn: () => axios.post('/api/v1/products/seed-defaults', {}, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
    onError: (e: unknown) => {
      const err = e as any
      setServerError(err?.response?.data?.error?.message || 'Не удалось создать базовые товары')
    },
  })

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      axios.put(`/api/v1/products/${id}`, data, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      resetForm()
    },
    onError: (e: unknown) => {
      const err = e as any
      setServerError(err?.response?.data?.error?.message || 'Ошибка при обновлении продукта')
    },
  })

  const previewUrls = useMemo(() => {
    return formImageFiles.map((f) => URL.createObjectURL(f))
  }, [formImageFiles])

  useEffect(() => {
    // Release object URLs to avoid memory leaks
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  useEffect(() => {
    // Defaults for homepage-card characteristics
    if (formCategory === 'BRIQUETTES') {
      setSpecTime('До 8 часов горения')
      setSpecTemp('900°C температура')
      setSpecNoSmoke('Без дыма и запаха')
    } else {
      setSpecTime('10 минут горения')
      setSpecNoChem('Без химии')
      setSpecStarter('Розжиг за 5-7 минут')
    }
  }, [formCategory])

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setServerError('')
    setFormName('')
    setFormSku('')
    setFormPrice('')
    setFormWholesalePrice('')
    setFormCategory('BRIQUETTES')
    setFormWeight('')
    setFormDescription('')
    setFormShortDesc('')
    setSpecTime('')
    setSpecTemp('')
    setSpecNoSmoke('')
    setSpecNoChem('')
    setSpecStarter('')
    setFormFeatured(false)
    setFormImageFiles([])
    setIsUploadingImages(false)
  }

  async function uploadImages(files: File[]) {
    if (!files.length) return []
    const urls: string[] = []

    for (const file of files) {
      const fd = new FormData()
      fd.append('image', file)
      const res = await axios.post('/api/v1/upload/image', fd, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      urls.push(String(res.data?.data?.url || ''))
    }

    return urls.filter(Boolean)
  }

  function toSlug(input: string) {
    return input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/gi, '-')
      .replace(/(^-|-$)/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsUploadingImages(true)
    try {
      const images = await uploadImages(formImageFiles)
      const price = Number(formPrice)
      const wholesalePriceRaw = formWholesalePrice ? Number(formWholesalePrice) : undefined

      const shortDesc =
        formShortDesc.trim() ||
        (formDescription.trim() ? formDescription.trim().slice(0, 140) : '')

      // Avoid sending invalid payloads to Prisma
      if (!formName.trim() || !formSku.trim() || !Number.isFinite(price) || !shortDesc) {
        setServerError('Заполни обязательные поля: Название, SKU, Цена и Описание/Короткое описание')
        return
      }

      const specs: Record<string, string> = {}
      if (formCategory === 'BRIQUETTES') {
        specs['Время горения'] = specTime.trim() || 'До 8 часов горения'
        specs['Температура'] = specTemp.trim() || '900°C температура'
        // Home expects one of these keys (we store both to be safe).
        const noSmokeValue = specNoSmoke.trim() || 'Без дыма и запаха'
        specs['Без дыма и запаха'] = noSmokeValue
        specs['Без дыма и золы'] = noSmokeValue
      } else {
        specs['Время горения'] = specTime.trim() || '10 минут горения'
        specs['Без химии'] = specNoChem.trim() || 'Без химии'
        specs['Розжиг'] = specStarter.trim() || 'Розжиг за 5-7 минут'
        specs['Розжиг за 5 минут'] = specStarter.trim() || 'Розжиг за 5-7 минут'
        specs['Розжиг за 5-7 минут'] = specStarter.trim() || 'Розжиг за 5-7 минут'
      }

      const payload = {
        name: formName.trim(),
        slug: toSlug(formName),
        sku: formSku.trim(),
        price,
        // Optional field: if empty - omit so Prisma keeps NULL
        ...(typeof wholesalePriceRaw === 'number' ? { priceWholesale: wholesalePriceRaw } : {}),
        category: formCategory,
        weight: Number(formWeight) || 0,
        description: formDescription,
        shortDesc,
        images: images.length ? images : [],
        specs,
        featured: formFeatured,
      }

      if (editingId) {
        updateProduct.mutate({ id: editingId, data: payload })
      } else {
        createProduct.mutate(payload)
      }
    } finally {
      setIsUploadingImages(false)
    }
  }

  function startEdit(product: Product) {
    setShowForm(true)
    setEditingId(product.id)
    setServerError('')
    setFormName(product.name || '')
    setFormSku(product.sku || '')
    setFormPrice(String(product.price ?? ''))
    setFormWholesalePrice(product.priceWholesale ? String(product.priceWholesale) : '')
    setFormCategory(product.category === 'FIRESTARTERS' ? 'FIRESTARTERS' : 'BRIQUETTES')
    setFormWeight(typeof product.weight === 'number' ? String(product.weight) : '')
    setFormDescription(product.description || '')
    setFormShortDesc(product.shortDesc || '')
    setFormFeatured(Boolean(product.featured))
    setFormImageFiles([])

    const specs = product.specs || {}
    setSpecTime(String(specs['Время горения'] || ''))
    setSpecTemp(String(specs['Температура'] || ''))
    setSpecNoSmoke(String(specs['Без дыма и запаха'] || specs['Без дыма и золы'] || ''))
    setSpecNoChem(String(specs['Без химии'] || ''))
    setSpecStarter(String(specs['Розжиг'] || specs['Розжиг за 5 минут'] || specs['Розжиг за 5-7 минут'] || ''))
  }

  const products = data || []
  const productsCount = products.length
  const canCreateMore = productsCount < 30

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Продукты</h1>
          <p className="text-white/40 text-sm">Управление каталогом · {productsCount}/30 товаров</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => seedDefaults.mutate()}
            disabled={seedDefaults.isPending}
            className="px-3 py-2 text-xs rounded-lg border border-white/15 text-white/80 hover:bg-white/5 transition-colors disabled:opacity-60"
          >
            {seedDefaults.isPending ? 'Создаю...' : 'Создать базовые товары'}
          </button>
          <button
            onClick={() => {
              if (!canCreateMore) return
              if (showForm && !editingId) {
                setShowForm(false)
              } else {
                resetForm()
                setShowForm(true)
              }
            }}
            disabled={!canCreateMore}
            className="btn-primary py-2.5 px-4 text-sm disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Добавить продукт
          </button>
        </div>
      </div>

      {!canCreateMore && (
        <div className="text-amber-300 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          Достигнут лимит 30 товаров. Удалите или отредактируйте существующие позиции.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4 bg-[#111111] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-medium text-sm">{editingId ? 'Редактирование продукта' : 'Новый продукт'}</h2>
            <button type="button" onClick={resetForm} className="p-1 text-white/30 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-white/40 text-xs">Название</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} required
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20" placeholder="Брикеты Premium" />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/40 text-xs">SKU</label>
              <input value={formSku} onChange={(e) => setFormSku(e.target.value)} required
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20" placeholder="BRQ-001" />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/40 text-xs">Цена (₽)</label>
              <input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20" placeholder="1500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/40 text-xs">Оптовая цена (₽)</label>
              <input type="number" value={formWholesalePrice} onChange={(e) => setFormWholesalePrice(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20" placeholder="1200" />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/40 text-xs">Категория</label>
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20">
                <option value="BRIQUETTES">Брикеты</option>
                <option value="FIRESTARTERS">Разжигатели</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-white/40 text-xs">Вес</label>
              <input value={formWeight} onChange={(e) => setFormWeight(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20" placeholder="10 кг" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-white/40 text-xs">Описание</label>
            <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3}
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 resize-none" placeholder="Описание продукта..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-white/40 text-xs">Короткое описание (карточка)</label>
            <input
              value={formShortDesc}
              onChange={(e) => setFormShortDesc(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20"
              placeholder="Например: профессиональные брикеты Pini Kay для ресторанов"
            />
          </div>

          <label className="flex items-center gap-2 text-white/70 text-sm">
            <input
              type="checkbox"
              checked={formFeatured}
              onChange={(e) => setFormFeatured(e.target.checked)}
              className="accent-[#FF6B35]"
            />
            Показывать как основной (featured)
          </label>

          <div className="space-y-1.5">
            <label className="text-white/40 text-xs">
              Характеристики (для главной карточки)
            </label>
            {formCategory === 'BRIQUETTES' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-white/40 text-xs">Время горения</label>
                  <input
                    value={specTime}
                    onChange={(e) => setSpecTime(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20"
                    placeholder="До 8 часов горения"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-white/40 text-xs">Температура</label>
                  <input
                    value={specTemp}
                    onChange={(e) => setSpecTemp(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20"
                    placeholder="900°C температура"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-white/40 text-xs">Без дыма / запаха</label>
                  <input
                    value={specNoSmoke}
                    onChange={(e) => setSpecNoSmoke(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20"
                    placeholder="Без дыма и запаха"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-white/40 text-xs">Время горения</label>
                  <input
                    value={specTime}
                    onChange={(e) => setSpecTime(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20"
                    placeholder="10 минут горения"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-white/40 text-xs">Без химии</label>
                  <input
                    value={specNoChem}
                    onChange={(e) => setSpecNoChem(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20"
                    placeholder="Без химии"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-white/40 text-xs">Розжиг (срок)</label>
                  <input
                    value={specStarter}
                    onChange={(e) => setSpecStarter(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20"
                    placeholder="Розжиг за 5-7 минут"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-white/40 text-xs">Фото товара</label>
            <input
              type="file"
              accept="image/*"
              multiple={false}
              onChange={(e) => setFormImageFiles(e.target.files ? Array.from(e.target.files) : [])}
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-white/10 file:bg-[#0A0A0A] file:text-white/70"
            />
            {previewUrls[0] && (
              <div className="flex items-center gap-3 mt-2">
                <img src={previewUrls[0]} alt="Превью продукта" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                <div className="text-white/40 text-xs">
                  {formImageFiles[0]?.name}
                </div>
              </div>
            )}
          </div>
          {serverError && (
            <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {serverError}
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-white/40 hover:text-white text-sm transition-colors">Отмена</button>
            <button
              type="submit"
              disabled={createProduct.isPending || updateProduct.isPending || isUploadingImages}
              className="btn-primary py-2 px-5 text-sm"
            >
              {createProduct.isPending || updateProduct.isPending
                ? 'Сохранение...'
                : isUploadingImages
                  ? 'Загрузка фото...'
                  : editingId
                    ? 'Сохранить изменения'
                    : 'Создать продукт'}
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-[#0D0D0D]">
              {['Продукт', 'SKU', 'Цена', 'Опт. цена', 'Категория', 'В наличии', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-white/30 text-xs font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product: Product) => (
              <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#111111] rounded-lg overflow-hidden flex-shrink-0">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{product.name}</div>
                      <div className="text-white/30 text-xs">{product.weight || ''} кг</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-white/40 text-xs font-mono">{product.sku}</td>
                <td className="px-4 py-4 text-white text-sm">{Number(product.price).toLocaleString('ru')} ₽</td>
                <td className="px-4 py-4 text-white/50 text-sm">
                  {product.priceWholesale ? `${Number(product.priceWholesale).toLocaleString('ru')} ₽` : '—'}
                </td>
                <td className="px-4 py-4 text-white/40 text-xs">{product.category}</td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => toggleStock.mutate(product)}
                    className={product.inStock ? 'text-green-400' : 'text-red-400/50'}
                  >
                    {product.inStock
                      ? <ToggleRight className="w-5 h-5" />
                      : <ToggleLeft className="w-5 h-5" />
                    }
                  </button>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(product)}
                      className="p-1.5 text-white/30 hover:text-white transition-colors"
                      title="Редактировать"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => confirm('Удалить продукт?') && deleteProduct.mutate(product.id)}
                      className="p-1.5 text-red-400/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!products.length && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-white/30 text-sm">Продукты не найдены</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
