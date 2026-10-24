'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

export default function StatusPieChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-400">ไม่มีข้อมูล</div>;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-col gap-3 justify-center">
        {payload.map((entry: any, index: number) => {
          const percent = total > 0 ? ((entry.payload.value / total) * 100).toFixed(0) : 0;
          return (
            <li key={`item-${index}`} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-600">{entry.value}</span>
              <span className="font-bold text-slate-800 ml-1">
                {entry.payload.value} ราย ({percent}%)
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm">
          <p className="font-bold text-slate-800 mb-1">{item.name}</p>
          <p className="text-slate-600">จำนวน: <span className="font-bold text-pink-500">{item.value}</span> ราย</p>
          <p className="text-slate-600">คิดเป็น: <span className="font-bold text-sky-500">{percent}%</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.3 }}
      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col"
    >
      <div className="mb-2">
        <h3 className="font-bold text-slate-800 text-lg">สถานะการติดตามเพื่อแก้ไขปัญหา</h3>
      </div>
      <div className="flex-1 flex items-center justify-center" suppressHydrationWarning>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={0} outerRadius={110} stroke="none" isAnimationActive={true} animationBegin={200} animationDuration={1500}>
              {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="vertical" verticalAlign="middle" align="right" content={renderLegend} wrapperStyle={{ paddingLeft: '20px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}