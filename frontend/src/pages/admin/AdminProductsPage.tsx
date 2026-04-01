import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  wholesalePrice: number
  category: string
  inStock: boolean
  images?: string[]
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient()

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

  const products = data || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Продукты</h1>
          <p className="text-white/40 text-sm">Управление каталогом</p>
        </div>
        <button className="btn-primary py-2.5 px-4 text-sm">
          <Plus className="w-4 h-4" />
          Добавить продукт
        </button>
      </div>

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
                      <div className="text-white/30 text-xs">{product.weight} кг</div>
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
