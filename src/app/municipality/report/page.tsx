'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, Printer, Package, Building2, TrendingUp, Filter, Coins, Users, ShieldCheck, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

// Custom Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm">
        <p className="font-bold text-slate-800 mb-1">{data.name}</p>
        <p className="text-slate-600">
          จำนวน: <span className={`font-bold ${data.isMoney ? 'text-amber-500' : 'text-pink-500'}`}>
            {data.value.toLocaleString()}
          </span> {data.isMoney ? 'บาท' : 'หน่วย'}
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip สำหรับกราฟรายบุคคล
const PersonTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm">
        <p className="font-bold text-slate-800 mb-2">{label}</p>
        {payload.map((p: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
            <span className="text-slate-600">{p.name}:</span>
            <span className="font-bold">{p.value} ครั้ง</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function MunicipalityReportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  const [rawData, setRawData] = useState<any[]>([]);
  
  const [agencyFilter, setAgencyFilter] = useState('ALL');
  const [itemFilter, setItemFilter] = useState('ALL');
  
  const [chartMode, setChartMode] = useState<'items' | 'money'>('items');
  const [personChartMode, setPersonChartMode] = useState<'agency' | 'item'>('agency');

  const [agencyOptions, setAgencyOptions] = useState<string[]>([]);
  const [itemOptions, setItemOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase()
        .from('interventions')
        .select(`
          *,
          vulnerable_persons ( prefix, first_name, last_name )
        `)
        .order('assistance_date', { ascending: false });

      if (!error && data) {
        setRawData(data);
        const agencies = Array.from(new Set(data.filter(d => d.agency).map(d => d.agency))) as string[];
        const items = Array.from(new Set(data.filter(d => d.aid_category).map(d => d.aid_category))) as string[];
        setAgencyOptions(agencies);
        setItemOptions(items);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleClearFilters = () => {
    setAgencyFilter('ALL');
    setItemFilter('ALL');
  };

  const filteredData = useMemo(() => {
    return rawData.filter(d => {
      const matchAgency = agencyFilter === 'ALL' || d.agency === agencyFilter;
      const matchItem = itemFilter === 'ALL' || d.aid_category === itemFilter;
      return matchAgency && matchItem;
    });
  }, [rawData, agencyFilter, itemFilter]);

  const { agencyChartData, itemsData, moneyData, totalFilteredInterventions, personChartData, uniqueKeys, colorMapping } = useMemo(() => {
    const COLORS = ['#EC4899', '#0EA5E9', '#F59E0B', '#10B981', '#8B5CF6', '#F43F5E'];

    const agencies: Record<string, number> = {};
    filteredData.filter(d => d.agency).forEach(d => {
      agencies[d.agency] = (agencies[d.agency] || 0) + 1;
    });
    const aData = Object.keys(agencies).map(key => ({
      name: key, value: agencies[key]
    })).sort((a, b) => b.value - a.value);

    const agencyColorMap: Record<string, string> = {};
    aData.forEach((item, index) => {
      agencyColorMap[item.name] = COLORS[index % COLORS.length];
    });
    agencyColorMap['ไม่ระบุ'] = '#94a3b8';

    const items: Record<string, number> = {};
    const money: Record<string, number> = {};
    
    filteredData.filter(d => d.aid_category).forEach(d => {
      const cat = d.aid_category;
      const qty = Number(d.aid_quantity) || 0;
      if (cat.includes('เงิน') || cat.includes('ทุน')) {
        money[cat] = (money[cat] || 0) + qty;
      } else {
        items[cat] = (items[cat] || 0) + qty;
      }
    });
    
    const itemDataArr = Object.keys(items).map(key => ({
      name: key, value: items[key], isMoney: false
    })).sort((a, b) => b.value - a.value);

    const moneyDataArr = Object.keys(money).map(key => ({
      name: key, value: money[key], isMoney: true
    })).sort((a, b) => b.value - a.value);

    const personStats: Record<string, any> = {};
    filteredData.forEach(d => {
      if (!d.vulnerable_persons) return;
      const personName = `${d.vulnerable_persons.first_name} ${d.vulnerable_persons.last_name}`;
      
      if (!personStats[personName]) {
        personStats[personName] = { name: personName, total: 0 };
      }
      
      let groupKey = '';
      if (personChartMode === 'agency') {
        groupKey = d.agency || 'ไม่ระบุ';
      } else {
        groupKey = d.aid_category || d.solution_type || 'อื่นๆ';
      }
      
      personStats[personName][groupKey] = (personStats[personName][groupKey] || 0) + 1;
      personStats[personName].total += 1;
    });

    const personDataArr = Object.values(personStats)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 10);

    const allKeys = Array.from(new Set(filteredData.map(d => {
      if (personChartMode === 'agency') return d.agency || 'ไม่ระบุ';
      return d.aid_category || d.solution_type || 'อื่นๆ';
    })));

    const dynamicColorMap: Record<string, string> = {};
    allKeys.forEach((key, index) => {
      if (personChartMode === 'agency') {
        dynamicColorMap[key] = agencyColorMap[key] || COLORS[index % COLORS.length];
      } else {
        dynamicColorMap[key] = COLORS[index % COLORS.length];
      }
    });

    return {
      agencyChartData: aData,
      itemsData: itemDataArr,
      moneyData: moneyDataArr,
      totalFilteredInterventions: filteredData.length,
      personChartData: personDataArr,
      uniqueKeys: allKeys,
      colorMapping: dynamicColorMap
    };
  }, [filteredData, personChartMode]);

  const COLORS = ['#EC4899', '#0EA5E9', '#F59E0B', '#10B981', '#8B5CF6', '#F43F5E'];

  const currentChartData = chartMode === 'items' ? itemsData : moneyData;

  const filterText = () => {
    if (agencyFilter === 'ALL' && itemFilter === 'ALL') return '(ข้อมูลทั้งหมด)';
    let text = '(ข้อมูลเฉพาะ: ';
    if (agencyFilter !== 'ALL') text += `หน่วยงาน ${agencyFilter} `;
    if (agencyFilter !== 'ALL' && itemFilter !== 'ALL') text += 'และ ';
    if (itemFilter !== 'ALL') text += `สิ่งของ ${itemFilter}`;
    text += ')';
    return text;
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-medium text-slate-500">กำลังโหลดข้อมูลรายงาน...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-20 print:bg-white print:pb-0">
      
      <div className="print:hidden">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/map')} className="p-2 hover:bg-slate-100 rounded-full">
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </button>
              <div>
                <h1 className="font-bold text-slate-900 text-lg">รายงานสถิติการช่วยเหลือ</h1>
                <p className="text-xs text-pink-600">สำหรับเจ้าหน้าที่เทศบาล</p>
              </div>
            </div>
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-md">
              <Printer className="w-4 h-4" /> พิมพ์รายงานตามตัวกรอง (PDF)
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-6 space-y-6 mt-4">
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center"
          >
            <div className="flex items-center gap-2 text-slate-700 font-medium mr-2">
              <Filter className="w-5 h-5 text-pink-500" /> ตัวกรองข้อมูล:
            </div>
            
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 hover:border-pink-300 transition-colors">
              <Building2 className="w-4 h-4 text-slate-400" />
              <select value={agencyFilter} onChange={e => setAgencyFilter(e.target.value)} className="bg-transparent outline-none text-sm text-slate-700 font-medium cursor-pointer min-w-[150px]">
                <option value="ALL">ทุกหน่วยงาน</option>
                {agencyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 hover:border-pink-300 transition-colors">
              <Package className="w-4 h-4 text-slate-400" />
              <select value={itemFilter} onChange={e => setItemFilter(e.target.value)} className="bg-transparent outline-none text-sm text-slate-700 font-medium cursor-pointer min-w-[150px]">
                <option value="ALL">สิ่งของ/ยาทั้งหมด</option>
                {itemOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <button
              onClick={handleClearFilters}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                agencyFilter !== 'ALL' || itemFilter !== 'ALL'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              disabled={agencyFilter === 'ALL' && itemFilter === 'ALL'}
            >
              <RotateCcw className="w-4 h-4" />
              ล้างตัวกรอง
            </button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center h-[450px] transition-all"
            >
              <h3 className="font-bold text-slate-800 mb-2 w-full text-left flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-500" /> การช่วยเหลือแยกตามหน่วยงาน
              </h3>
              {agencyChartData.length > 0 ? (
                <>
                  <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={agencyChartData} 
                          dataKey="value" 
                          cx="50%" cy="50%" 
                          innerRadius={80} outerRadius={110} 
                          paddingAngle={5} 
                          stroke="none"
                          isAnimationActive={true}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        >
                          {agencyChartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value} ครั้ง`, 'จำนวน']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                    >
                      <span className="text-slate-400 text-sm">การช่วยเหลือรวม</span>
                      <span className="text-3xl font-bold text-slate-800">{totalFilteredInterventions}</span>
                      <span className="text-slate-400 text-xs">ครั้ง</span>
                    </motion.div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full mt-2">
                    {agencyChartData.map((d, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + (i * 0.1) }}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-slate-600 truncate">{d.name}</span>
                        </div>
                        <span className="font-bold text-slate-800">{d.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">ไม่พบข้อมูล</div>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[450px] transition-all"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  {chartMode === 'items' ? <Package className="w-5 h-5 text-pink-500" /> : <Coins className="w-5 h-5 text-amber-500" />} 
                  {chartMode === 'items' ? 'จำนวนสิ่งของที่จ่ายไป' : 'จำนวนเงินที่จ่ายไป'}
                </h3>
                
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setChartMode('items')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${chartMode === 'items' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    สิ่งของ
                  </button>
                  <button 
                    onClick={() => setChartMode('money')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${chartMode === 'money' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    เงิน
                  </button>
                </div>
              </div>
              
              {currentChartData.length > 0 ? (
                <div className="flex-1 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentChartData} layout="vertical" margin={{ left: 0, right: 30, top: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => chartMode === 'money' && value >= 1000 ? `${value / 1000}K` : value} />
                      <YAxis dataKey="name" type="category" width={110} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="value" fill={chartMode === 'money' ? '#F59E0B' : '#EC4899'} radius={[0, 6, 6, 0]} barSize={32} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" animationBegin={300}>
                        {currentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartMode === 'money' ? '#F59E0B' : COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                  {chartMode === 'items' ? 'ไม่พบข้อมูลสิ่งของ' : 'ไม่พบข้อมูลเงินสงเคราะห์'}
                </div>
              )}
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[500px]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" /> จำนวนครั้งที่ได้รับการช่วยเหลือรายบุคคล (10 อันดับแรก)
              </h3>
              
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setPersonChartMode('agency')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${personChartMode === 'agency' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Building2 className="w-3.5 h-3.5" /> แยกตามหน่วยงาน
                </button>
                <button 
                  onClick={() => setPersonChartMode('item')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${personChartMode === 'item' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> แยกตามสิ่งที่ได้รับ
                </button>
              </div>
            </div>
            
            {personChartData.length > 0 ? (
              <div className="flex-1 w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={personChartData} margin={{ top: 20, right: 0, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 11, fontWeight: 'bold' }} angle={-45} textAnchor="end" height={60} interval={0} />
                    <YAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip content={<PersonTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                    
                    {uniqueKeys.map((key, index) => (
                      <Bar key={key} dataKey={key} stackId="a" name={key} fill={colorMapping[key] || '#94a3b8'} barSize={40} radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1500} animationBegin={index * 100} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">ไม่พบข้อมูล</div>
            )}
          </motion.div>

        </div>
      </div>

      {/* 🟢 Print Layout (ซ่อนในหน้าจอปกติ) */}
      <div className="hidden print:block w-full max-w-[210mm] mx-auto p-8 bg-white text-black">
        <div className="flex items-center gap-5 border-b-2 border-slate-800 pb-5 mb-6">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">รายงานสรุปผลการให้ความช่วยเหลือ</h1>
            <h2 className="text-lg font-semibold text-slate-700 mt-1">เทศบาลตำบลท่าวังทอง อำเภอเมืองพะเยา จังหวัดพะเยา</h2>
            <p className="text-sm text-slate-500 mt-1">
              ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })} 
              <span className="font-bold text-pink-600 ml-2">{filterText()}</span>
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-lg bg-slate-100 p-2 mb-3 border-l-4 border-pink-500">1. สรุปภาพรวมการช่วยเหลือ</h3>
          <table className="w-full text-sm text-left border-collapse border border-slate-300">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3 px-4 border-b border-slate-300 w-1/2">รายการ</th>
                <th className="py-3 px-4 border-b border-slate-300 text-center">จำนวน</th>
                <th className="py-3 px-4 border-b border-slate-300 text-center">หน่วย</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4 border-b border-slate-200">จำนวนครั้งที่ให้การช่วยเหลือ (ตามตัวกรอง)</td>
                <td className="py-3 px-4 border-b border-slate-200 text-center font-bold">{filteredData.length}</td>
                <td className="py-3 px-4 border-b border-slate-200 text-center">ครั้ง</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-lg bg-slate-100 p-2 mb-3 border-l-4 border-pink-500">2. สรุปยอดจ่ายสิ่งของ/เงิน แยกตามประเภท</h3>
          {(() => {
             const aids: Record<string, number> = {};
             filteredData.filter(d => d.aid_category).forEach(d => {
               const cat = d.aid_category;
               aids[cat] = (aids[cat] || 0) + (Number(d.aid_quantity) || 0);
             });
             const printAidData = Object.keys(aids).map(key => ({ name: key, value: aids[key] })).sort((a, b) => b.value - a.value);
             
             return printAidData.length > 0 ? (
              <table className="w-full text-sm text-left border-collapse border border-slate-300">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="py-2 px-4 border-b border-slate-300">ประเภท</th>
                    <th className="py-2 px-4 border-b border-slate-300 text-center">จำนวนที่จ่ายไป</th>
                    <th className="py-2 px-4 border-b border-slate-300 text-center">หน่วย</th>
                  </tr>
                </thead>
                <tbody>
                  {printAidData.map((d, i) => {
                    const isMoney = d.name.includes('เงิน') || d.name.includes('ทุน');
                    return (
                      <tr key={i}>
                        <td className="py-2 px-4 border-b border-slate-200">{d.name}</td>
                        <td className="py-2 px-4 border-b border-slate-200 text-center font-bold">{d.value.toLocaleString()}</td>
                        <td className="py-2 px-4 border-b border-slate-200 text-center">{isMoney ? 'บาท' : 'ชิ้น/ชุด'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-slate-500 italic">- ไม่พบข้อมูลตามตัวกรองที่เลือก -</p>
            );
          })()}
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-lg bg-slate-100 p-2 mb-3 border-l-4 border-pink-500">3. รายละเอียดการให้ความช่วยเหลือรายบุคคล</h3>
          {filteredData.length > 0 ? (
            <table className="w-full text-sm text-left border-collapse border border-slate-300">
              <thead className="bg-slate-50">
                <tr>
                  <th className="py-2 px-3 border-b border-slate-300 w-24">วันที่</th>
                  <th className="py-2 px-3 border-b border-slate-300">ชื่อ-นามสกุลผู้รับ</th>
                  <th className="py-2 px-3 border-b border-slate-300">สิ่งที่ได้รับ</th>
                  <th className="py-2 px-3 border-b border-slate-300">หน่วยงาน</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((inv: any) => (
                  <tr key={inv.id}>
                    <td className="py-2 px-3 border-b border-slate-200 whitespace-nowrap">
                      {inv.assistance_date ? new Date(inv.assistance_date).toLocaleDateString('th-TH') : '-'}
                    </td>
                    <td className="py-2 px-3 border-b border-slate-200">
                      {inv.vulnerable_persons ? 
                        `${inv.vulnerable_persons.prefix || ''}${inv.vulnerable_persons.first_name} ${inv.vulnerable_persons.last_name}` 
                        : '-'}
                    </td>
                    <td className="py-2 px-3 border-b border-slate-200">
                      {inv.aid_category ? `${inv.aid_category} (${inv.aid_quantity} ${inv.aid_unit})` : inv.solution_type}
                    </td>
                    <td className="py-2 px-3 border-b border-slate-200">{inv.agency || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-slate-500 italic">- ไม่มีประวัติการช่วยเหลือตามตัวกรองที่เลือก -</p>
          )}
        </div>

        <div className="mt-16 flex justify-end">
          <div className="text-center w-72">
            <p className="mb-8 text-sm text-slate-600">ลงชื่อ ....................................................</p>
            <p className="text-sm font-bold text-slate-800">( ................................................... )</p>
            <p className="text-xs text-slate-500 mt-1">เจ้าหน้าที่ผู้จัดทำรายงาน</p>
            <p className="text-xs text-slate-400 mt-1">วันที่ ......./......./.......</p>
          </div>
        </div>

      </div>
    </main>
  );
}