import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  wholesalePrice: number
  category: string
  weight?: string
  description?: string
  inStock: boolean
  images?: string[]
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formSku, setFormSku] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formWholesalePrice, setFormWholesalePrice] = useState('')
  const [formCategory, setFormCategory] = useState('briquettes')
  const [formWeight, setFormWeight] = useState('')
  const [formDescription, setFormDescription] = useState('')

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
  })

  function resetForm() {
    setShowForm(false)
    setFormName('')
    setFormSku('')
    setFormPrice('')
    setFormWholesalePrice('')
    setFormCategory('briquettes')
    setFormWeight('')
    setFormDescription('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createProduct.mutate({
      name: formName,
      sku: formSku,
      price: Number(formPrice),
      wholesalePrice: Number(formWholesalePrice) || 0,
      category: formCategory,
      weight: formWeight,
      description: formDescription,
    })
  }

  const products = data || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Продукты</h1>
          <p className="text-white/40 text-sm">Управление каталогом</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary py-2.5 px-4 text-sm">
          <Plus className="w-4 h-4" />
          Добавить продукт
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4 bg-[#111111] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-medium text-sm">Новый продукт</h2>
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
                <option value="briquettes">Брикеты</option>
                <option value="firestarters">Разжигатели</option>
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
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-white/40 hover:text-white text-sm transition-colors">Отмена</button>
            <button type="submit" disabled={createProduct.isPending} className="btn-primary py-2 px-5 text-sm">
              {createProduct.isPending ? 'Сохранение...' : 'Создать продукт'}
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
                  {product.wholesalePrice ? `${Number(product.wholesalePrice).toLocaleString('ru')} ₽` : '—'}
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
                      onClick={() => alert(`Редактирование: ${product.name}`)}
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
