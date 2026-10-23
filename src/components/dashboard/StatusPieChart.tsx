'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  statusData: any[];
}

export default function StatusPieChart({ statusData }: Props) {
  const hasData = statusData.length > 0;
  
  const displayData = hasData ? statusData : [
    { name: 'ยังไม่มีข้อมูล', value: 1, color: '#e2e8f0' }
  ];
  
  const total = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-bold text-slate-800 text-lg">สถานะการติดตามเพื่อแก้ไขปัญหา</h3>
      </div>
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6">
        
        <div className="space-y-4 w-full md:w-auto">
          {hasData ? (
            displayData.map((item, idx) => {
              const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
              
              return (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-sm text-slate-600">{item.name}</p>
                    <p className="text-lg font-bold text-slate-800">
                      {item.value} ราย 
                      <span className="text-sm font-medium text-slate-400 ml-1.5">({percent}%)</span>
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-start gap-2">
              <span className="w-3 h-3 rounded-full mt-1 shrink-0 bg-slate-200" />
              <div>
                <p className="text-sm text-slate-500">ยังไม่มีข้อมูล</p>
                <p className="text-sm text-slate-400">รอการบันทึก</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-[200px] h-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={displayData} 
                dataKey="value" 
                cx="50%" 
                cy="50%" 
                outerRadius={90} 
                stroke="none"
                isAnimationActive={true}
                animationDuration={1500}
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {/* 👇 แก้เป็น any แล้ว 👇 */}
              {hasData && (
                <Tooltip 
                  formatter={(value: any) => [`${value} ราย`, 'จำนวน']} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} 
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}