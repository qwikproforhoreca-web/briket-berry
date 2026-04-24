import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, ChevronUp, ChevronDown } from 'lucide-react'

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
  sortOrder?: number
}

interface SpecRow {
  key: string
  value: string
}

export default function AdminProductsPage() {
  const getErrorMessage = (e: unknown, fallback: string) => {
    const err = e as { response?: { data?: { error?: { message?: string } } } }
    return err.response?.data?.error?.message || fallback
  }

  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [formName, setFormName] = useState('')
  const [formSku, setFormSku] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formWholesalePrice, setFormWholesalePrice] = useState('')
  const [formCategory, setFormCategory] = useState<'BRIQUETTES' | 'FIRESTARTERS'>('BRIQUETTES')
  const [formWeight, setFormWeight] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formShortDesc, setFormShortDesc] = useState('')
  const [formSpecs, setFormSpecs] = useState<SpecRow[]>([])
  const [formFeatured, setFormFeatured] = useState(false)
  const [formImageFiles, setFormImageFiles] = useState<File[]>([])
  const [formExistingImages, setFormExistingImages] = useState<string[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isReordering, setIsReordering] = useState(false)

  const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || ''
  const resolveImageUrl = (url?: string) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
    if (url.startsWith('/uploads/') && API_BASE) return `${API_BASE}${url}`
    return url
  }

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
      setSuccessMessage('Товар успешно сохранен')
      resetForm()
    },
    onError: (e: unknown) => {
      setServerError(getErrorMessage(e, 'Ошибка при создании продукта'))
    },
  })

  const seedDefaults = useMutation({
    mutationFn: () => axios.post('/api/v1/products/seed-defaults', {}, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setSuccessMessage('Базовые товары готовы')
    },
    onError: (e: unknown) => {
      setServerError(getErrorMessage(e, 'Не удалось создать базовые товары'))
    },
  })

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      axios.put(`/api/v1/products/${id}`, data, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setSuccessMessage('Изменения успешно сохранены')
      resetForm()
    },
    onError: (e: unknown) => {
      setServerError(getErrorMessage(e, 'Ошибка при обновлении продукта'))
    },
  })

  const previewUrls = useMemo(() => {
    return formImageFiles.map((f) => URL.createObjectURL(f))
  }, [formImageFiles])

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

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
    setFormSpecs([])
    setFormFeatured(false)
    setFormImageFiles([])
    setFormExistingImages([])
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
      urls.push(String(res.data?.data?.absoluteUrl || res.data?.data?.url || ''))
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
    setServerError('')
    setSuccessMessage('')
    setIsUploadingImages(true)
    try {
      const images = await uploadImages(formImageFiles)
      const price = Number(formPrice)
      const wholesalePriceRaw = formWholesalePrice ? Number(formWholesalePrice) : undefined

      const shortDesc =
        formShortDesc.trim() ||
        (formDescription.trim() ? formDescription.trim().slice(0, 140) : '')

      if (!formName.trim() || !formSku.trim() || !Number.isFinite(price) || !shortDesc) {
        setServerError('Заполни обязательные поля: Название, SKU, Цена и Описание/Короткое описание')
        return
      }

      // Build specs object from free-form rows
      const specs: Record<string, string> = {}
      for (const { key, value } of formSpecs) {
        const k = key.trim()
        if (k) specs[k] = value.trim()
      }

      const payload = {
        name: formName.trim(),
        slug: toSlug(formName),
        sku: formSku.trim(),
        price,
        ...(typeof wholesalePriceRaw === 'number' ? { priceWholesale: wholesalePriceRaw } : {}),
        category: formCategory,
        weight: Number(formWeight) || 0,
        description: formDescription,
        shortDesc,
        images: images.length ? images : formExistingImages,
        specs,
        featured: formFeatured,
      }

      if (editingId) {
        updateProduct.mutate({ id: editingId, data: payload })
      } else {
        createProduct.mutate(payload)
      }
    } catch (e) {
      setServerError(getErrorMessage(e, 'Ошибка загрузки фото или сохранения'))
    } finally {
      setIsUploadingImages(false)
    }
  }

  function startEdit(product: Product) {
    setShowForm(true)
    setEditingId(product.id)
    setServerError('')
    setSuccessMessage('')
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
    setFormExistingImages(Array.isArray(product.images) ? product.images : [])

    // Load specs as free-form key-value rows
    const entries = Object.entries(product.specs || {}).map(([key, value]) => ({
      key,
      value: String(value || ''),
    }))
    setFormSpecs(entries)
  }

  function addSpecRow() {
    setFormSpecs(prev => [...prev, { key: '', value: '' }])
  }

  function removeSpecRow(index: number) {
    setFormSpecs(prev => prev.filter((_, i) => i !== index))
  }

  function updateSpecRow(index: number, field: 'key' | 'value', newValue: string) {
    setFormSpecs(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: newValue }
      return next
    })
  }

  async function handleReorder(productId: string, direction: 'up' | 'down') {
    const list: Product[] = products
    const idx = list.findIndex(p => p.id === productId)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= list.length) return

    const a = list[idx]
    const b = list[swapIdx]
    const aOrder = a.sortOrder ?? idx
    const bOrder = b.sortOrder ?? swapIdx

    setIsReordering(true)
    try {
      await Promise.all([
        axios.put(`/api/v1/products/${a.id}`, { sortOrder: bOrder }, { withCredentials: true }),
        axios.put(`/api/v1/products/${b.id}`, { sortOrder: aOrder }, { withCredentials: true }),
      ])
      await queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    } finally {
      setIsReordering(false)
    }
  }

  const products: Product[] = data || []
  const productsCount = products.length
  const canCreateMore = productsCount < 30

  const inputCls = 'w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20'

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

      {successMessage && (
        <div className="text-green-300 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
          {successMessage}
        </div>
      )}

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
              <input value={formName} onChange={(e) => setFormName(e.target.value)} required className={inputCls} placeholder="Брикеты Premium" />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/40 text-xs">SKU</label>
              <input value={formSku} onChange={(e) => setFormSku(e.target.value)} required className={inputCls} placeholder="BRQ-001" />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/40 text-xs">Цена (₽)</label>
              <input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required className={inputCls} placeholder="1500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/40 text-xs">Оптовая цена (₽)</label>
              <input type="number" value={formWholesalePrice} onChange={(e) => setFormWholesalePrice(e.target.value)} className={inputCls} placeholder="1200" />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/40 text-xs">Категория</label>
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as 'BRIQUETTES' | 'FIRESTARTERS')} className={inputCls}>
                <option value="BRIQUETTES">Брикеты</option>
                <option value="FIRESTARTERS">Разжигатели</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-white/40 text-xs">Вес / фасовка</label>
              <input value={formWeight} onChange={(e) => setFormWeight(e.target.value)} className={inputCls} placeholder="10 кг" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-white/40 text-xs">Описание</label>
            <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3}
              className={`${inputCls} resize-none`} placeholder="Описание продукта..." />
          </div>

          <div className="space-y-1.5">
            <label className="text-white/40 text-xs">Короткое описание (карточка)</label>
            <input value={formShortDesc} onChange={(e) => setFormShortDesc(e.target.value)} className={inputCls}
              placeholder="Например: профессиональные брикеты Pini Kay для ресторанов" />
          </div>

          <label className="flex items-center gap-2 text-white/70 text-sm">
            <input type="checkbox" checked={formFeatured} onChange={(e) => setFormFeatured(e.target.checked)} className="accent-[#FF6B35]" />
            Показывать как основной (featured)
          </label>

          {/* Free-form specs editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-white/40 text-xs">Характеристики (для карточки)</label>
              <button
                type="button"
                onClick={addSpecRow}
                className="text-xs text-brand-orange/80 hover:text-brand-orange transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Добавить строку
              </button>
            </div>
            {formSpecs.length === 0 && (
              <p className="text-white/25 text-xs py-1.5">Нажмите «Добавить строку» чтобы добавить характеристику (например: Время горения → До 8 часов)</p>
            )}
            <div className="space-y-2">
              {formSpecs.map((spec, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={spec.key}
                    onChange={(e) => updateSpecRow(i, 'key', e.target.value)}
                    className="flex-1 bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-white/20"
                    placeholder="Название (напр. Время горения)"
                  />
                  <input
                    value={spec.value}
                    onChange={(e) => updateSpecRow(i, 'value', e.target.value)}
                    className="flex-1 bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-white/20"
                    placeholder="Значение (напр. До 8 часов)"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecRow(i)}
                    className="p-1.5 text-red-400/40 hover:text-red-400 transition-colors flex-shrink-0"
                    title="Удалить строку"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
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
                <div className="text-white/40 text-xs">{formImageFiles[0]?.name}</div>
              </div>
            )}
            {!previewUrls[0] && formExistingImages[0] && (
              <div className="flex items-center gap-3 mt-2">
                <img src={resolveImageUrl(formExistingImages[0])} alt="Текущее фото товара" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                <div className="text-white/40 text-xs">Текущее сохраненное фото</div>
              </div>
            )}
          </div>

          {serverError && (
            <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {serverError}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-white/40 hover:text-white text-sm transition-colors">
              Отмена
            </button>
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
              {['Порядок', 'Продукт', 'SKU', 'Цена', 'Опт. цена', 'Категория', 'В наличии', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-white/30 text-xs font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product: Product, idx: number) => (
              <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                {/* Sort order controls */}
                <td className="px-3 py-4">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleReorder(product.id, 'up')}
                      disabled={idx === 0 || isReordering}
                      className="p-0.5 text-white/20 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                      title="Переместить вверх"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleReorder(product.id, 'down')}
                      disabled={idx === products.length - 1 || isReordering}
                      className="p-0.5 text-white/20 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                      title="Переместить вниз"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#111111] rounded-lg overflow-hidden flex-shrink-0">
                      {product.images?.[0] && (
                        <img src={resolveImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
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
                    {product.inStock ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
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
                      title="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!products.length && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-white/30 text-sm">
                  Продукты не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
