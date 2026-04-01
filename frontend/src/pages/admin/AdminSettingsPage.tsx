import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Upload, Save, Eye, EyeOff, Bot, Video, Globe, CreditCard, Mail } from 'lucide-react'
import clsx from 'clsx'

const TABS = [
  { id: 'general', label: 'Общее', icon: Globe },
  { id: 'video', label: 'Видео', icon: Video },
  { id: 'ai', label: 'ИИ-консультант', icon: Bot },
  { id: 'payment', label: 'Оплата', icon: CreditCard },
  { id: 'email', label: 'Email', icon: Mail },
]

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [saved, setSaved] = useState(false)
  const videoRef = useRef<HTMLInputElement>(null)

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => axios.get('/api/v1/settings/all', { withCredentials: true }).then(r => r.data.data),
  })

  const updateSetting = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      axios.put(`/api/v1/settings/${key}`, { value }, { withCredentials: true }),
    onSuccess: () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const uploadVideo = async (file: File, type: 'hero' | 'tutorial') => {
    const formData = new FormData()
    formData.append('video', file)
    formData.append('type', type)
    await axios.post('/api/v1/upload/video', formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  const settingsMap = (settings as { key: string; value: string }[] | undefined)
    ?.reduce<Record<string, string>>((acc, s) => { acc[s.key] = s.value; return acc }, {}) ?? {}

  const handleSave = (key: string, value: string) => {
    updateSetting.mutate({ key, value })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Настройки</h1>
        <p className="text-white/40 text-sm">Управление конфигурацией сайта</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
          ✅ Сохранено
        </div>
      )}

      <div className="flex gap-4">
        {/* Tabs sidebar */}
        <div className="w-52 space-y-1 flex-shrink-0">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'admin-sidebar-item w-full',
                  activeTab === tab.id ? 'active' : ''
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 card p-6 space-y-5">
          {activeTab === 'general' && (
            <>
              <h2 className="font-semibold text-white">Общие настройки</h2>
              {[
                { key: 'site.phone', label: 'Телефон', placeholder: '+7 (900) 000-00-00' },
                { key: 'site.whatsapp', label: 'WhatsApp', placeholder: '+79000000000' },
                { key: 'site.telegram', label: 'Telegram', placeholder: '@briket_berry' },
                { key: 'site.email', label: 'Email', placeholder: 'info@briket-berry.ru' },
                { key: 'site.address', label: 'Адрес', placeholder: 'Москва' },
              ].map((field) => (
                <SettingField
                  key={field.key}
                  label={field.label}
                  defaultValue={settingsMap[field.key] || ''}
                  placeholder={field.placeholder}
                  onSave={(val) => handleSave(field.key, val)}
                />
              ))}
            </>
          )}

          {activeTab === 'video' && (
            <>
              <h2 className="font-semibold text-white">Управление видео</h2>

              <div className="space-y-6">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Фоновое видео (Hero)</label>
                  <div className="p-4 bg-[#111111] rounded-xl border border-white/10 space-y-3">
                    <div className="text-white/40 text-xs">Текущее: {settingsMap['hero.videoUrl'] || '/videos/charcoal-bg.mp4'}</div>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0], 'hero')}
                      className="hidden"
                      ref={videoRef}
                    />
                    <button
                      onClick={() => videoRef.current?.click()}
                      className="btn-secondary py-2 px-4 text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      Загрузить новое видео (MP4, до 100MB)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">Видео-инструкция</label>
                  <div className="p-4 bg-[#111111] rounded-xl border border-white/10 space-y-3">
                    <div className="text-white/40 text-xs">Текущее: {settingsMap['tutorial.videoUrl'] || 'Не загружено'}</div>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0], 'tutorial')}
                      className="hidden"
                      id="tutorial-video"
                    />
                    <label htmlFor="tutorial-video" className="btn-secondary py-2 px-4 text-sm cursor-pointer inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Загрузить видео-инструкцию
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'ai' && (
            <>
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-brand-orange" />
                ИИ-консультант
              </h2>

              <div className="flex items-center justify-between p-4 bg-[#111111] rounded-xl border border-white/10">
                <div>
                  <div className="text-white text-sm font-medium">Включить консультанта</div>
                  <div className="text-white/40 text-xs">Отображать чат-виджет на сайте</div>
                </div>
                <button
                  onClick={() => handleSave('ai.enabled', settingsMap['ai.enabled'] === 'true' ? 'false' : 'true')}
                  className={clsx(
                    'w-12 h-6 rounded-full transition-colors relative',
                    settingsMap['ai.enabled'] === 'true' ? 'bg-brand-orange' : 'bg-white/10'
                  )}
                >
                  <span className={clsx(
                    'absolute top-1 w-4 h-4 bg-white rounded-full transition-all',
                    settingsMap['ai.enabled'] === 'true' ? 'left-7' : 'left-1'
                  )} />
                </button>
              </div>

              {[
                { key: 'ai.botName', label: 'Имя бота', placeholder: 'Огонёк' },
              ].map((field) => (
                <SettingField
                  key={field.key}
                  label={field.label}
                  defaultValue={settingsMap[field.key] || ''}
                  placeholder={field.placeholder}
                  onSave={(val) => handleSave(field.key, val)}
                />
              ))}

              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Системный промпт</label>
                <textarea
                  defaultValue={settingsMap['ai.systemPrompt'] || ''}
                  rows={8}
                  className="input-field resize-none"
                  placeholder="Ты — консультант Брикет-Бери..."
                  onBlur={(e) => handleSave('ai.systemPrompt', e.target.value)}
                />
              </div>
            </>
          )}

          {activeTab === 'payment' && (
            <>
              <h2 className="font-semibold text-white">Настройки оплаты (ЮКасса)</h2>
              {[
                { key: 'payment.shopId', label: 'Shop ID', placeholder: '123456' },
                { key: 'payment.secretKey', label: 'Secret Key', placeholder: 'live_...', secret: true },
                { key: 'payment.returnUrl', label: 'Return URL', placeholder: 'https://briket-berry.ru/order/success' },
              ].map((field) => (
                <SettingField
                  key={field.key}
                  label={field.label}
                  defaultValue={settingsMap[field.key] || ''}
                  placeholder={field.placeholder}
                  secret={field.secret}
                  onSave={(val) => handleSave(field.key, val)}
                />
              ))}
            </>
          )}

          {activeTab === 'email' && (
            <>
              <h2 className="font-semibold text-white">Настройки Email</h2>
              {[
                { key: 'email.smtpHost', label: 'SMTP Host', placeholder: 'smtp.mail.ru' },
                { key: 'email.smtpPort', label: 'SMTP Port', placeholder: '465' },
                { key: 'email.user', label: 'Пользователь', placeholder: 'info@briket-berry.ru' },
                { key: 'email.password', label: 'Пароль', placeholder: '••••••••', secret: true },
                { key: 'email.notifyTo', label: 'Email менеджера', placeholder: 'orders@briket-berry.ru' },
              ].map((field) => (
                <SettingField
                  key={field.key}
                  label={field.label}
                  defaultValue={settingsMap[field.key] || ''}
                  placeholder={field.placeholder}
                  secret={field.secret}
                  onSave={(val) => handleSave(field.key, val)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingField({
  label, defaultValue, placeholder, secret, onSave
}: {
  label: string
  defaultValue: string
  placeholder?: string
  secret?: boolean
  onSave: (val: string) => void
}) {
  const [value, setValue] = useState(defaultValue)
  const [showSecret, setShowSecret] = useState(false)

  return (
    <div>
      <label className="text-white/60 text-sm mb-1.5 block">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={secret && !showSecret ? 'password' : 'text'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="input-field pr-10"
          />
          {secret && (
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        <button
          onClick={() => onSave(value)}
          className="btn-primary py-3 px-4 text-sm"
        >
          <Save className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
