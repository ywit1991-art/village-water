'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  statusData: any[];
}

export default function StatusPieChart({ statusData }: Props) {
  // ถ้าไม่มีข้อมูล ให้ใช้ข้อมูลจำลอง
  const hasData = statusData && statusData.length > 0;
  const displayData = hasData ? statusData : [
    { name: 'ช่วยเหลือแล้ว', value: 2, color: '#EC4899' },
    { name: 'รอดำเนินการ', value: 2, color: '#0EA5E9' }
  ];
  
  const total = displayData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-bold text-slate-800 text-sm md:text-lg">สถานะการติดตามเพื่อแก้ไขปัญหา</h3>
      </div>
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4">
        
        <div className="space-y-3 w-full md:w-auto">
          {displayData.map((item, idx) => {
            const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
            return (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-xs md:text-sm text-slate-600">{item.name}</p>
                  <p className="text-base md:text-lg font-bold text-slate-800">
                    {item.value} ราย <span className="text-xs font-medium text-slate-400">({percent}%)</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-[180px] h-[180px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={displayData} dataKey="value" cx="50%" cy="50%" outerRadius={80} stroke="none" isAnimationActive={true} animationDuration={1500}>
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`${value} ราย`, 'จำนวน']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}