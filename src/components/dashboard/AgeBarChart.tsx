'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#7DD3FC', '#38BDF8', '#0EA5E9', '#F9A8D4', '#EC4899'];

export default function AgeBarChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-400">ไม่มีข้อมูล</div>;

  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.3 }}
      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col"
    >
      <div className="mb-4">
        <h3 className="font-bold text-slate-800 text-lg">โครงสร้างประชากรตามช่วงวัย</h3>
      </div>
      <div className="flex-1" suppressHydrationWarning>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40} isAnimationActive={true} animationBegin={300} animationDuration={1500} animationEasing="ease-out">
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}