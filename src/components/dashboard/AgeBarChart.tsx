'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  ageData: any[];
}

const COLORS = ['#0EA5E9', '#7DD3FC', '#F9A8D4', '#EC4899', '#BE185D'];

export default function AgeBarChart({ ageData }: Props) {
  // ถ้าไม่มีข้อมูล ให้ใช้ข้อมูลจำลอง
  const displayData = ageData && ageData.length > 0 ? ageData : [
    { name: 'วัยรุ่น (15-24)', value: 1 },
    { name: 'วัยแรงงาน (25-59)', value: 3 },
    { name: 'ผู้สูงอายุ (60-69)', value: 1 }
  ];

  return (
    <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-bold text-slate-800 text-sm md:text-lg">โครงสร้างประชากรตามช่วงวัย</h3>
        <p className="text-slate-500 text-xs md:text-sm">เปรียบเทียบสัดส่วนวัยแรงงานกับวัยพึ่งพิง</p>
      </div>

      <div className="flex-1 min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} formatter={(value: any) => [`${value} ราย`, 'จำนวน']} />
            
            <Bar dataKey="value" name="จำนวน" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1500} barSize={40}>
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}