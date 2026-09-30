import Link from 'next/link'
import { MapPin, Users, ClipboardList, ArrowRight, Droplets } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-50 via-white to-brand-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-200/40 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-300/30 blur-3xl" />

      <main className="relative flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full text-center">
          {/* Logo ใหญ่ตรงกลาง */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-brand-400/40 blur-3xl scale-125" />
              <img
                src="/logo.png"
                alt="ตราเทศบาลตำบลท่าวังทอง"
                className="relative w-40 h-40 md:w-56 md:h-56 rounded-full shadow-2xl shadow-brand-500/40 ring-8 ring-white/80"
              />
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-brand-900 leading-tight">
            ข้อมูลประปาหมู่บ้าน
          </h1>
          <p className="mt-3 text-lg md:text-xl text-brand-600 font-medium">
            เทศบาลตำบลท่าวังทอง · อำเภอเมืองพะเยา · จังหวัดพะเยา
          </p>

          <div className="my-8 h-1.5 w-24 mx-auto bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 rounded-full" />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Feature
              icon={<Droplets className="text-sky-600" />}
              bg="bg-sky-50"
              title="ข้อมูลประปา"
              desc="ตำแหน่ง สถานะ และข้อมูล"
            />
            <Feature
              icon={<Users className="text-indigo-600" />}
              bg="bg-indigo-50"
              title="ข้อมูลผู้ใช้น้ำ"
              desc="ครัวเรือน คณะกรรมการ และช่างประปา"
            />
            <Feature
              icon={<ClipboardList className="text-emerald-600" />}
              bg="bg-emerald-50"
              title="ติดตามสถานะ"
              desc="ดี พอใช้ ต้องปรับปรุง เร่งด่วน"
            />
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/overview"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 text-white font-bold text-base shadow-xl shadow-brand-500/30 hover:scale-105 hover:shadow-2xl transition-all"
            >
              <MapPin size={20} />
              ดูข้อมูลประปาหมู่บ้าน
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/admin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border-2 border-brand-200 text-brand-700 font-bold text-base hover:border-brand-400 hover:bg-brand-50 transition"
            >
              👤 สำหรับเจ้าหน้าที่
            </Link>
          </div>
        </div>
      </main>

<footer className="relative py-4 px-4">
  <div className="flex items-center justify-center gap-3 text-xs md:text-sm text-slate-600">
    <img
      src="/logo.png"
      alt="ตราเทศบาล"
      className="w-11 h-11 rounded-full ring-2 ring-brand-200 shrink-0"
    />
    <div className="text-center leading-snug">
      <p className="font-medium text-brand-800">
        เทศบาลตำบลท่าวังทอง เลขที่ 131 หมู่ที่ 4 ถนนพะเยา-ป่าแดด
      </p>
      <p className="text-slate-500">
        ตำบลท่าวังทอง อำเภอเมืองพะเยา จังหวัดพะเยา 56000
      </p>
    </div>
  </div>
</footer>
    </div>
  )
}

function Feature({
  icon,
  bg,
  title,
  desc,
}: {
  icon: React.ReactNode
  bg: string
  title: string
  desc: string
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-brand-100 shadow-sm hover:shadow-md transition">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${bg}`}
      >
        {icon}
      </div>
      <h3 className="font-bold text-brand-900 text-sm md:text-base">{title}</h3>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </div>
  )
}