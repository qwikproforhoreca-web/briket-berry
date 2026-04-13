import { Clock, Thermometer, Leaf, Award, Wind } from 'lucide-react'

const trustItems = [
  { icon: Award, text: '500+ ресторанов' },
  { icon: Clock, text: 'До 12 часов горения' },
  { icon: Wind, text: 'Без дыма и запаха' },
  { icon: Leaf, text: 'Экологически чистый' },
  { icon: Thermometer, text: 'Температура 900°C' },
  { icon: Award, text: 'Производство Россия' },
  { icon: Clock, text: '1 кг = 3 кг угля' },
  { icon: Wind, text: 'Без копоти и сажи' },
]

export default function TrustBar() {
  // Duplicate for seamless marquee
  const allItems = [...trustItems, ...trustItems]

  return (
    <div className="bg-[#111111] border-y border-white/5 py-4 overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#111111] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#111111] to-transparent z-10 pointer-events-none" />

      <div className="flex animate-marquee" style={{ width: 'max-content' }}>
        {allItems.map((item, i) => {
          const Icon = item.icon
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 mx-8 whitespace-nowrap"
            >
              <Icon className="w-4 h-4 text-brand-orange flex-shrink-0" />
              <span className="text-white/60 text-sm font-medium">{item.text}</span>
              <span className="text-brand-orange/30 mx-2">•</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
