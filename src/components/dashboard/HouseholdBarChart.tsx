'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { VULN, type VulnType } from '@/lib/constants';

interface Props {
  barData: any[];
}

export default function HouseholdBarChart({ barData }: Props) {
  const legendItems = Object.keys(VULN) as VulnType[];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-bold text-slate-800 text-lg">จำนวนครัวเรือนเปราะบาง</h3>
        <p className="text-slate-500 text-sm mb-4">แยกตามหมู่บ้านและประเภท</p>
        
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {legendItems.map((key) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: VULN[key].color }} />
              <span className="text-xs text-slate-600">{VULN[key].label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            
            {/* Animation วิ่งขึ้นทีละแท่ง */}
            <Bar dataKey="ELDERLY" name={VULN.ELDERLY.label} stackId="a" fill={VULN.ELDERLY.color} isAnimationActive={true} animationDuration={1000} />
            <Bar dataKey="DISABLED" name={VULN.DISABLED.label} stackId="a" fill={VULN.DISABLED.color} isAnimationActive={true} animationDuration={1000} />
            <Bar dataKey="BEDRIDDEN" name={VULN.BEDRIDDEN.label} stackId="a" fill={VULN.BEDRIDDEN.color} isAnimationActive={true} animationDuration={1000} />
            <Bar dataKey="LOW_INCOME" name={VULN.LOW_INCOME.label} stackId="a" fill={VULN.LOW_INCOME.color} isAnimationActive={true} animationDuration={1000} />
            <Bar dataKey="PREGNANT" name={VULN.PREGNANT.label} stackId="a" fill={VULN.PREGNANT.color} isAnimationActive={true} animationDuration={1000} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}