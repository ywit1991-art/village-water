import { MapPin, Home, ClipboardList, Droplets } from 'lucide-react'

interface Props {
  totalVillages: number
  totalSystems: number
  totalHouseholds: number
  totalSurveys: number
}

export default function SummaryStats({
  totalVillages,
  totalSystems,
  totalHouseholds,
  totalSurveys,
}: Props) {
  const cards = [
    {
      icon: <MapPin size={20} />,
      value: totalVillages,
      label: 'หมู่บ้าน',
      color: 'text-brand-600 bg-brand-50',
    },
    {
      icon: <Droplets size={20} />,
      value: totalSystems,
      label: 'ระบบประปา',
      color: 'text-sky-600 bg-sky-50',
    },
    {
      icon: <Home size={20} />,
      value: totalHouseholds,
      label: 'ครัวเรือน',
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      icon: <ClipboardList size={20} />,
      value: totalSurveys,
      label: 'แบบสำรวจ',
      color: 'text-emerald-600 bg-emerald-50',
    },
  ]

  return (
    <section>
      <h2 className="text-lg font-bold text-brand-900 mb-3">
        ภาพรวมทั้งตำบล
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <div key={i} className="card p-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${c.color}`}
            >
              {c.icon}
            </div>
            <p className="text-2xl md:text-3xl font-bold text-brand-900 leading-tight">
              {c.value.toLocaleString()}
            </p>
            <p className="text-xs text-brand-600 mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}