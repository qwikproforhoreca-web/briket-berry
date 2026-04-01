export interface Product {
  id: string
  slug: string
  name: string
  description: string
  shortDesc: string
  price: number
  priceWholesale?: number
  wholesaleMinQty?: number
  weight: number
  sku: string
  inStock: boolean
  featured: boolean
  images: string[]
  category: 'BRIQUETTES' | 'FIRESTARTERS' | 'ACCESSORIES'
  specs: Record<string, string>
  sortOrder: number
}

export interface Review {
  id: string
  name: string
  position: string
  company: string
  city: string
  rating: number
  text: string
  photo?: string
  published: boolean
  featured: boolean
  verified: boolean
  publishedAt?: string
  createdAt: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentMethod: 'ONLINE' | 'INVOICE'
  name: string
  phone: string
  email?: string
  establishment: string
  establishmentType: EstablishmentType
  city: string
  comment?: string
  inn?: string
  organizationName?: string
  directorName?: string
  legalAddress?: string
  subtotal: number
  discountAmount: number
  totalAmount: number
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export type OrderStatus =
  | 'PENDING'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'AWAITING_INVOICE'
  | 'INVOICE_SENT'
  | 'CONFIRMED'
  | 'IN_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'

export type EstablishmentType =
  | 'RESTAURANT'
  | 'CAFE'
  | 'SHAWARMA'
  | 'DELIVERY'
  | 'OTHER'

export interface Setting {
  key: string
  value: string
  type: string
  label: string
  group: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: { field: string; message: string }[]
  }
}

export interface OrderFormData {
  piniKay10kg: number
  piniKay20kg: number
  firestarters8: number
  paymentMethod: 'online' | 'invoice'
  name: string
  phone: string
  email?: string
  establishment: string
  establishmentType: EstablishmentType
  city: string
  comment?: string
  privacyConsent: boolean
  inn?: string
  organizationName?: string
  directorName?: string
  legalAddress?: string
  website?: string
}

export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
