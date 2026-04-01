import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send } from 'lucide-react'
import axios from 'axios'
import FlameLogo from '@/components/ui/Flamelogo'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Привет! 🔥 Я Огонёк — консультант Брикет-Бери.\nПомогу выбрать уголь для вашего заведения, рассчитать расход и ответить на любые вопросы. Чем могу помочь?',
  timestamp: new Date(),
}

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sessionId = useRef(Math.random().toString(36).slice(2))

  useEffect(() => {
    if (!isOpen) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setHasUnread(false)
    const t = setTimeout(() => inputRef.current?.focus(), 150)
    return () => clearTimeout(t)
  }, [messages, isOpen])

  // Show attention bubble once after 8s — isOpen ref used to avoid stale closure
  const isOpenRef = useRef(isOpen)
  useEffect(() => { isOpenRef.current = isOpen }, [isOpen])
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpenRef.current) setHasUnread(true)
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const history = [...messages, userMessage].slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await axios.post('/api/v1/ai/chat', {
        messages: history,
        sessionId: sessionId.current,
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.data.reply,
          timestamp: new Date(),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Извините, что-то пошло не так. Позвоните нам: +7 (900) 000-00-00',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.93 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed bottom-24 right-5 z-50 w-[360px] max-h-[520px] flex flex-col"
            style={{
              background: '#111111',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,107,0,0.08)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #181818 0%, #1A1208 100%)',
                borderBottom: '1px solid rgba(255,107,0,0.12)',
                borderRadius: '20px 20px 0 0',
              }}
            >
              {/* Flame avatar */}
              <div className="relative flex-shrink-0">
                <FlameLogo size={40} withGlow={true} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm">Огонёк</div>
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="typing"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1.5"
                    >
                      <span className="text-amber-400 text-xs font-medium">Огонёк печатает</span>
                      <span className="flex gap-0.5 mt-0.5">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-1 h-1 rounded-full bg-amber-400 inline-block"
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                          />
                        ))}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="online"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1"
                    >
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="text-white/40 text-xs">Онлайн · Консультант</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1">
                      🔥
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'text-white rounded-2xl rounded-tr-sm'
                        : 'text-white/85 rounded-2xl rounded-tl-sm border border-white/5'
                    }`}
                    style={
                      msg.role === 'user'
                        ? { background: 'linear-gradient(135deg, #FF6B00, #CC4400)' }
                        : { background: '#1C1C1C' }
                    }
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing animation bubble */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-start items-end gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center text-xs flex-shrink-0">
                      🔥
                    </div>
                    <div
                      className="px-4 py-3.5 rounded-2xl rounded-tl-sm border border-white/5"
                      style={{ background: '#1C1C1C' }}
                    >
                      <div className="flex gap-1 items-center">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ background: 'rgba(255,107,0,0.7)' }}
                            animate={{
                              opacity: [0.3, 1, 0.3],
                              scale: [0.8, 1.1, 0.8],
                              y: [0, -3, 0],
                            }}
                            transition={{
                              duration: 0.9,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {[
                  'Как рассчитать расход?',
                  'Цены на опт',
                  'Как использовать?',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt)
                      setTimeout(() => sendMessage(), 50)
                    }}
                    className="text-xs px-3 py-1.5 rounded-full border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/5 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Напишите вопрос..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none transition-colors"
                  style={{
                    background: '#1C1C1C',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  disabled={isLoading}
                />
                <motion.button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #FF6B00, #CC4400)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <div className="fixed bottom-5 right-5 z-50">
        {/* Unread badge */}
        <AnimatePresence>
          {hasUnread && !isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="absolute -top-12 right-0 bg-[#111] border border-orange-500/30 rounded-xl px-3 py-2 text-xs text-white/80 whitespace-nowrap shadow-xl"
            >
              🔥 Задайте вопрос Огоньку!
              <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-[#111] border-r border-b border-orange-500/30 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => { setIsOpen(!isOpen); setHasUnread(false) }}
          className="relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl overflow-visible"
          style={{
            background: isOpen
              ? 'linear-gradient(135deg, #555, #333)'
              : 'linear-gradient(135deg, #FF6B00, #CC3300)',
            boxShadow: isOpen ? 'none' : '0 0 30px rgba(255,107,0,0.45)',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.93 }}
          aria-label="Открыть чат с консультантом Огонёк"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div key="flame" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
                <FlameLogo size={36} withGlow={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  )
}
