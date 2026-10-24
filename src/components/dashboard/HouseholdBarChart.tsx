'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

export default function HouseholdBarChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-400">ไม่มีข้อมูล</div>;

  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.3 }}
      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col"
    >
      <div className="mb-4">
        <h3 className="font-bold text-slate-800 text-lg">จำนวนครัวเรือนเปราะบาง</h3>
      </div>
      <div className="flex-1" suppressHydrationWarning>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
            <Tooltip cursor={{ fill: '#f8fafc' }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="ELDERLY" name="ผู้สูงอายุ" stackId="a" fill="#A855F7" barSize={20} isAnimationActive={true} animationBegin={0} animationDuration={1000} />
            <Bar dataKey="DISABLED" name="ผู้พิการ" stackId="a" fill="#F97316" barSize={20} isAnimationActive={true} animationBegin={200} animationDuration={1000} />
            <Bar dataKey="BEDRIDDEN" name="ผู้ป่วยติดเตียง" stackId="a" fill="#EF4444" barSize={20} isAnimationActive={true} animationBegin={400} animationDuration={1000} />
            <Bar dataKey="LOW_INCOME" name="รายได้น้อย" stackId="a" fill="#F59E0B" barSize={20} isAnimationActive={true} animationBegin={600} animationDuration={1000} />
            <Bar dataKey="PREGNANT" name="ตั้งครรภ์" stackId="a" fill="#3B82F6" barSize={20} radius={[4, 4, 0, 0]} isAnimationActive={true} animationBegin={800} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}