'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo, useEffect } from 'react';
import { X, Phone, FileText, MapPin, CheckCircle2, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/ui/Header';
import type { Person } from '@/types';
import type { VulnType } from '@/lib/constants';
import { VULN } from '@/lib/constants';
import { logAccess } from '@/lib/tracking';
import { supabase } from '@/lib/supabase/client';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-soft flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
    </div>
  ),
});

export default function MapPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [villageFilter, setVillageFilter] = useState('ALL');
  const [interventionFilter, setInterventionFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  const [selected, setSelected] = useState<Person | null>(null);

  useEffect(() => {
    const staffCode = sessionStorage.getItem('staff_code');
    const role = sessionStorage.getItem('staff_role');

    if (!staffCode || (role !== 'MUNICIPALITY' && role !== 'SUPERADMIN')) {
      router.replace('/login');
      return;
    }
    setCurrentUser(staffCode);
    logAccess(staffCode, 'VIEW_MAP');

    const fetchPersons = async () => {
      const { data, error } = await supabase()
        .from('vulnerable_persons')
        .select('*, interventions(*)')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        const formattedData: Person[] = data.map((d: any) => ({
          id: d.id,
          national_id: d.national_id, // 👈 เพิ่มบรรทัดนี้
          prefix: d.prefix,
          first_name: d.first_name,
          last_name: d.last_name,
          birth_date: d.birth_date,
          gender: null,
          phone: d.phone,
          latitude: d.latitude,
          longitude: d.longitude,
          photo_urls: d.photo_urls || [],
          note: d.note,
          vulnerabilities: d.vulnerabilities || [],
          interventions: d.interventions || [],
          created_by: d.created_by,   // 👈 เพิ่มบรรทัดนี้
          created_at: d.created_at,   // 👈 เพิ่มบรรทัดนี้
        }));
        setAllPersons(formattedData);
      }
    };
    
    fetchPersons();
  }, [router]);

  const handleLogout = () => {
    if (currentUser) logAccess(currentUser, 'LOGOUT');
    sessionStorage.clear();
    router.replace('/');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setVillageFilter('ALL');
    setInterventionFilter('ALL');
    setTypeFilter('ALL');
  };

  const filteredPersons = useMemo(() => {
    return allPersons.filter((person) => {
      const fullName = `${person.first_name} ${person.last_name}`.toLowerCase();
      const matchSearch = fullName.includes(searchQuery.toLowerCase().trim());
      const matchType = typeFilter === 'ALL' || person.vulnerabilities.includes(typeFilter as VulnType);
      const matchVillage = villageFilter === 'ALL' || (person.note && person.note.includes(`หมู่ที่ ${villageFilter}`));
      
      let matchIntervention = true;
      if (interventionFilter === 'none') {
        matchIntervention = !person.interventions || person.interventions.length === 0;
      } else if (interventionFilter !== 'ALL') {
        matchIntervention = person.interventions?.some((i: any) => i.solution_type === interventionFilter) || false;
      }

      return matchSearch && matchType && matchVillage && matchIntervention;
    });
  }, [allPersons, searchQuery, typeFilter, villageFilter, interventionFilter]);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <MapView persons={filteredPersons} onSelect={setSelected} />
      
      <Header
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        villageFilter={villageFilter} setVillageFilter={setVillageFilter}
        interventionFilter={interventionFilter} setInterventionFilter={setInterventionFilter}
        typeFilter={typeFilter} setTypeFilter={setTypeFilter}
        onClearFilters={handleClearFilters}
        onLogout={handleLogout}
      />

      {/* 👇 ปุ่มดูรายงานสถิติ (สำหรับเทศบาล) 👇 */}
      <button
        onClick={() => router.push('/municipality/report')}
        className="absolute top-[76px] left-4 z-[9999] flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full shadow-lg text-sm font-medium transition-colors"
      >
        <BarChart3 className="w-4 h-4" /> ดูรายงานสถิติ
      </button>

      {/* Popup Modal แสดงข้อมูลบุคคล */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-9 h-9 bg-slate-100/80 hover:bg-red-100 text-slate-500 hover:text-red-500 rounded-full flex items-center justify-center transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 overflow-y-auto">
                <h3 className="text-xl font-bold text-slate-900 pr-8">
                  {selected.prefix}{selected.first_name} {selected.last_name}
                </h3>
                
                <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                  {selected.vulnerabilities.map((v) => (
                    <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-white" style={{ backgroundColor: VULN[v as VulnType]?.color || '#94a3b8' }}>
                      {VULN[v as VulnType]?.emoji} {VULN[v as VulnType]?.label || v}
                    </span>
                  ))}
                </div>

                <div className="space-y-2 text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-2xl">
                  <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> {selected.note || 'ไม่ระบุที่อยู่'}</p>
                  {selected.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {selected.phone}</p>}
                </div>

                <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> ประวัติการช่วยเหลือ
                </h4>
                {selected.interventions && selected.interventions.length > 0 ? (
                  <div className="space-y-2 mb-6">
                    {selected.interventions.map((inv: any) => (
                      <div key={inv.id} className="text-sm border border-slate-100 p-3 rounded-xl bg-white">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          inv.solution_type === 'ช่วยเหลือ' ? 'bg-pink-100 text-pink-700' : 'bg-sky-100 text-sky-700'
                        }`}>{inv.solution_type}</span>
                        <p className="text-slate-600 mt-1">หน่วยงาน: {inv.agency || '-'} • วันที่: {inv.assistance_date ? new Date(inv.assistance_date).toLocaleDateString('th-TH') : '-'}</p>
                        {inv.aid_category && (
                          <p className="text-slate-600">สิ่งของ: {inv.aid_category} ({inv.aid_quantity} {inv.aid_unit})</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 mb-6 italic">ยังไม่มีการบันทึกการช่วยเหลือ</p>
                )}

                <button
                  onClick={() => window.open(`/person/${selected.id}/print`, '_blank')}
                  className="w-full py-3 bg-slate-800 text-white rounded-xl font-medium shadow-md flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
                >
                  <FileText className="w-5 h-5" /> ดูข้อมูล / พิมพ์เอกสาร (PDF)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}