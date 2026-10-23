'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  solutionData: any[];
}

export default function SolutionDonutChart({ solutionData }: Props) {
  const displayData = solutionData.length > 0 ? solutionData : [
    { name: 'ยังไม่มีข้อมูล', value: 1, color: '#e2e8f0' }
  ];
  
  const total = solutionData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-bold text-slate-800 text-lg">แนวทางการแก้ไขปัญหา</h3>
      </div>
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="space-y-4">
          {displayData.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: item.color }} />
              <div>
                <p className="text-sm text-slate-600">{item.name}</p>
                <p className="text-lg font-bold text-slate-800">
                  {solutionData.length > 0 ? `${item.value} ราย` : '0 ราย'}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="w-[180px] h-[180px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={displayData} 
                dataKey="value" 
                cx="50%" 
                cy="50%" 
                innerRadius={55} 
                outerRadius={80} 
                stroke="none" 
                paddingAngle={solutionData.length > 0 ? 2 : 0}
                isAnimationActive={true}
                animationDuration={1500}
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {/* 👇 แก้เป็น any แล้ว 👇 */}
              {solutionData.length > 0 && <Tooltip formatter={(value: any) => [`${value} ราย`, 'จำนวน']} contentStyle={{ borderRadius: '12px', border: 'none' }} />}
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-800">{total} ราย</span>
            <span className="text-[10px] text-slate-500 text-center">เป้าหมายการช่วยเหลือ</span>
          </div>
        </div>
      </div>
    </div>
  );
}