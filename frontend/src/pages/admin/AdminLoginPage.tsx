import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { Flame, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'

const loginSchema = z.object({
  email: z.string().email('Неверный email'),
  password: z.string().min(1, 'Введите пароль'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setServerError('')
    try {
      const res = await axios.post('/api/v1/admin/login', data, { withCredentials: true })
      // Store token in localStorage for cross-domain auth
      if (res.data?.data?.token) {
        localStorage.setItem('admin_token', res.data.data.token)
      }
      navigate('/admin')
    } catch (e) {
      const err = e as { response?: { data?: { error?: { message?: string } } } }
      setServerError(err.response?.data?.error?.message || 'Неверный email или пароль')
    }
  }

  return (
    <>
      <Helmet>
        <title>Вход в панель управления | Брикет-Бери</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(255,107,43,0.4)]">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display font-black text-2xl text-white">Брикет-Бери</h1>
            <p className="text-white/40 text-sm mt-1">Панель управления</p>
          </div>

          {/* Form */}
          <div className="card p-8">
            <h2 className="font-bold text-white text-xl mb-6">Вход в систему</h2>

            {serverError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@briket-berry.ru"
                  className="input-field"
                  autoComplete="email"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Пароль</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input-field pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2 justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Вход...
                  </span>
                ) : 'Войти'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
