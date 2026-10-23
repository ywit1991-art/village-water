'use client';

import { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { VULN, type VulnType } from '@/lib/constants';

// ข้อมูลเริ่มต้นเป็น 0 (รอการบันทึกข้อมูลจริง)
const lineData = [
  { year: '2022', registered: 0, assisted: 0 },
  { year: '2023', registered: 0, assisted: 0 },
  { year: '2024', registered: 0, assisted: 0 },
  { year: '2025', registered: 0, assisted: 0 },
  { year: '2026', registered: 0, assisted: 0 },
];

interface ChartsSectionProps {
  typeCounts: Record<VulnType, number>;
}

export default function ChartsSection({ typeCounts }: ChartsSectionProps) {
  const [viewMode, setViewMode] = useState<'household' | 'member'>('household');

  // แปลงข้อมูลสำหรับกราฟวงกลม (เอาเฉพาะที่มีจำนวนมากกว่า 0)
  const pieData = (Object.keys(VULN) as VulnType[])
    .map(key => ({
      name: VULN[key].label,
      value: typeCounts[key] || 0,
      color: VULN[key].color
    }))
    .filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-500">{entry.name}:</span>
              <span className="font-semibold text-slate-800">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
      
      {/* 🔹 กราฟเส้น: เปรียบเทียบการช่วยเหลือ */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">เปรียบเทียบจำนวนที่ช่วยเหลือแล้ว</h3>
            <p className="text-slate-500 text-sm">กับจำนวนที่ขึ้นทะเบียน (ปี 2022 - 2026)</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('household')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'household' ? 'bg-[#1e3a8a] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              ครัวเรือน
            </button>
            <button 
              onClick={() => setViewMode('member')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'member' ? 'bg-[#1e3a8a] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              สมาชิก
            </button>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAssisted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a3a338" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a3a338" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRegistered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => value.toLocaleString()} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
              
              <Area type="monotone" name="จำนวนที่ช่วยเหลือแล้ว" dataKey="assisted" stroke="#a3a338" strokeWidth={2} fillOpacity={1} fill="url(#colorAssisted)" activeDot={{ r: 6, fill: '#a3a338', stroke: '#fff', strokeWidth: 2 }} dot={{ r: 4, fill: '#a3a338', stroke: '#fff', strokeWidth: 2 }} />
              <Area type="monotone" name="จำนวนที่ขึ้นทะเบียน" dataKey="registered" stroke="#64748b" strokeWidth={2} fillOpacity={1} fill="url(#colorRegistered)" activeDot={{ r: 6, fill: '#64748b', stroke: '#fff', strokeWidth: 2 }} dot={{ r: 4, fill: '#64748b', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🔹 กราฟวงกลม: แบ่งประเภทกลุ่มเปราะบาง */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
        <div className="mb-2">
          <h3 className="font-bold text-slate-800 text-lg">สัดส่วนประเภทกลุ่มเปราะบาง</h3>
          <p className="text-slate-500 text-sm">ภาพรวมผู้ลงทะเบียนแยกตามประเภท</p>
        </div>

        <div className="flex-1 min-h-[280px] relative">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: any) => [`${value} ราย`, 'จำนวน']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '13px', paddingLeft: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-2">📭</span>
              <span>ยังไม่มีข้อมูลในระบบ</span>
            </div>
          )}
          
          {pieData.length > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-slate-400 text-xs">รวมทั้งหมด</span>
              <span className="text-3xl font-bold text-slate-800">
                {pieData.reduce((sum, item) => sum + item.value, 0)}
              </span>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}