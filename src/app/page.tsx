'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, MapPin, AlertCircle, ShieldCheck, HeartPulse, UserCheck } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { VULN, type VulnType } from '@/lib/constants';
import { supabase } from '@/lib/supabase/client';

const PublicMap = dynamic(() => import('@/components/map/PublicMap'), { ssr: false });
const HouseholdBarChart = dynamic(() => import('@/components/dashboard/HouseholdBarChart'), { ssr: false });
const AgeBarChart = dynamic(() => import('@/components/dashboard/AgeBarChart'), { ssr: false });
const StatusPieChart = dynamic(() => import('@/components/dashboard/StatusPieChart'), { ssr: false });
const SolutionDonutChart = dynamic(() => import('@/components/dashboard/SolutionDonutChart'), { ssr: false });

export default function PublicHomePage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // State ข้อมูลหลัก
  const [stats, setStats] = useState({ total: 0, typeCounts: {} as Record<VulnType, number> });
  const [insights, setInsights] = useState({ overlap: 0, pending: 0, livesAlone: 0 });
  
  // State ข้อมูลกราฟ
  const [barData, setBarData] = useState<any[]>([]);
  const [mapVillages, setMapVillages] = useState<any[]>([]); 
  const [ageData, setAgeData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [solutionData, setSolutionData] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);

    const fetchData = async () => {
      try {
        const { data: vulnerableData, error } = await supabase().from('vulnerable_persons').select('*');
        const { data: registryData } = await supabase().from('registry_persons').select('national_id, village_no');
        const { data: interventions } = await supabase().from('interventions').select('*');

        if (!error && vulnerableData) {
          // 1. คำนวณยอดรวมและประเภท
          const typeCounts = {} as Record<VulnType, number>;
          (Object.keys(VULN) as VulnType[]).forEach(key => {
            typeCounts[key] = vulnerableData.filter((p: any) => p.vulnerabilities?.includes(key)).length;
          });
          setStats({ total: vulnerableData.length, typeCounts });

          // 2. คำนวณ Insights (การทับซ้อน, รอดำเนินการ, อยู่ลำพัง)
          const overlapCount = vulnerableData.filter((p: any) => p.vulnerabilities?.length > 1).length;
          const assistedIds = new Set(interventions?.map(i => i.person_id) || []);
          const pendingCount = vulnerableData.filter((p: any) => !assistedIds.has(p.id)).length;
          const livesAloneCount = vulnerableData.filter((p: any) => p.lives_alone === true || p.note?.includes('อยู่คนเดียว')).length; // ประมาณการจาก note
          
          setInsights({ overlap: overlapCount, pending: pendingCount, livesAlone: livesAloneCount });

          // 3. คำนวณกราฟแท่งหมู่บ้านและแผนที่
          const villagesData = Array.from({ length: 14 }).map((_, i) => {
            const moo = i + 1;
            const mooData = vulnerableData.filter((v: any) => {
              const regInfo = registryData?.find((r: any) => r.national_id === v.national_id);
              return regInfo && parseInt(regInfo.village_no) === moo;
            });

            const total = mooData.length;
            let color = '#FDF2F8';
            if (total >= 5) color = '#BE185D';
            else if (total >= 3) color = '#EC4899';
            else if (total >= 1) color = '#F9A8D4';

            return {
              id: moo, name: `หมู่ ${moo}`, count: total, color: color,
              ELDERLY: mooData.filter((p: any) => p.vulnerabilities?.includes('ELDERLY')).length,
              DISABLED: mooData.filter((p: any) => p.vulnerabilities?.includes('DISABLED')).length,
              BEDRIDDEN: mooData.filter((p: any) => p.vulnerabilities?.includes('BEDRIDDEN')).length,
              LOW_INCOME: mooData.filter((p: any) => p.vulnerabilities?.includes('LOW_INCOME')).length,
              PREGNANT: mooData.filter((p: any) => p.vulnerabilities?.includes('PREGNANT')).length,
            };
          });
          setBarData(villagesData);
          setMapVillages(villagesData);

          // 4. คำนวณช่วงอายุ (คำนวณจาก birth_date)
          const currentYear = new Date().getFullYear();
          const getAge = (birth: string) => birth ? currentYear - new Date(birth).getFullYear() : 0;
          
          const ageGroups = [
            { name: 'เด็ก (0-14)', min: 0, max: 14 },
            { name: 'วัยรุ่น (15-24)', min: 15, max: 24 },
            { name: 'วัยแรงงาน (25-59)', min: 25, max: 59 },
            { name: 'ผู้สูงอายุ (60-69)', min: 60, max: 69 },
            { name: 'สูงอายุมาก (70+)', min: 70, max: 150 }
          ];

          const ageStats = ageGroups.map(group => ({
            name: group.name,
            value: vulnerableData.filter((p: any) => {
              const age = getAge(p.birth_date);
              return age >= group.min && age <= group.max;
            }).length
          }));
          setAgeData(ageStats);

          // 5. คำนวณสถานะการช่วยเหลือ
          setStatusData([
            { name: 'ช่วยเหลือแล้ว', value: vulnerableData.length - pendingCount, color: '#EC4899' },
            { name: 'รอดำเนินการ', value: pendingCount, color: '#0EA5E9' },
          ].filter(item => item.value > 0));

          // 6. คำนวณแนวทางแก้ไข
          const adviceCount = interventions?.filter(i => i.solution_type === 'ให้คำแนะนำ').length || 0;
          const helpCount = interventions?.filter(i => i.solution_type === 'ช่วยเหลือ').length || 0;
          const referCount = interventions?.filter(i => i.solution_type === 'ประสานส่งต่อ').length || 0;

          setSolutionData([
            { name: 'ให้คำแนะนำ', value: adviceCount, color: '#0EA5E9' },
            { name: 'ให้ความช่วยเหลือ', value: helpCount, color: '#EC4899' },
            { name: 'ประสานส่งต่อ', value: referCount, color: '#F9A8D4' },
          ].filter(item => item.value > 0));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingData(false); 
      }
    };

    fetchData();
  }, []);

  if (!isMounted || isLoadingData) return <div className="min-h-screen bg-slate-50" />;

  return (
    <main className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      <header className="bg-white shadow-sm z-20 sticky top-0">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full p-1 border border-slate-100">
              <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-tight">ระบบข้อมูลกลุ่มเปราะบาง</h1>
              <p className="text-xs text-pink-600 font-medium">เทศบาลตำบลท่าวังทอง</p>
            </div>
          </div>
          <button onClick={() => router.push('/login')} className="flex items-center gap-2 bg-gradient-brand text-white px-6 py-2.5 rounded-full font-semibold shadow-glow hover:scale-105 transition-all text-sm">
            <LogIn className="w-4 h-4" /> เข้าสู่ระบบเจ้าหน้าที่
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 flex-1 flex flex-col gap-6">
        
        {/* Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="col-span-2 md:col-span-1 bg-gradient-brand rounded-2xl p-5 text-white shadow-glow flex flex-col justify-center">
            <p className="text-white/80 font-medium mb-1 text-sm">ผู้ลงทะเบียนทั้งหมด</p>
            <h3 className="text-3xl font-bold">{stats.total} <span className="text-sm font-normal">ราย</span></h3>
          </div>
          {(Object.keys(VULN) as VulnType[]).map((key) => (
            <div key={key} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{VULN[key].emoji}</span>
                <p className="text-slate-500 text-xs font-medium">{VULN[key].label}</p>
              </div>
              <h4 className="text-2xl font-bold text-slate-800">{stats.typeCounts[key] || 0}</h4>
            </div>
          ))}
        </motion.div>

        {/* 👇 Executive Insights (ข้อมูลเชิงลึกสไตล์สากล) 👇 */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-2xl p-5 text-white shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <p className="text-slate-300 text-sm">ผู้รอรับความช่วยเหลือ</p>
              <h3 className="text-2xl font-bold">{insights.pending} ราย</h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">ความเปราะบางทับซ้อน (2+ ด้าน)</p>
              <h3 className="text-2xl font-bold text-slate-800">{insights.overlap} ราย</h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6 text-sky-500" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">ผู้ใช้ชีวิตลำพัง (กลุ่มเสี่ยงสูง)</p>
              <h3 className="text-2xl font-bold text-slate-800">{insights.livesAlone} ราย</h3>
            </div>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          
          {/* แผนที่ */}
          <div className="bg-white p-4 rounded-3xl shadow-soft border border-slate-100 flex flex-col relative overflow-hidden h-[400px]">
            <div className="flex justify-between items-center mb-4 px-2 z-10 relative">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <MapPin className="text-pink-500" /> แผนที่ความหนาแน่น
              </h2>
            </div>
            <div className="relative w-full flex-1 rounded-2xl overflow-hidden border border-slate-100">
              <PublicMap villages={mapVillages} />
            </div>
          </div>

          {/* กราฟแท่งหมู่บ้าน */}
          <div className="h-[400px]">
            <HouseholdBarChart barData={barData} />
          </div>

          {/* กราฟช่วงอายุ (ใหม่) */}
          <div className="h-[350px]">
            <AgeBarChart ageData={ageData} />
          </div>

          {/* กราฟสถานะ */}
          <div className="h-[350px]">
            <StatusPieChart statusData={statusData} />
          </div>
          
        </motion.div>
      </div>
    </main>
  );
}