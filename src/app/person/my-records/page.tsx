'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import { checkAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Edit, Plus, History, Loader2 } from 'lucide-react';
import { VULN, type VulnType } from '@/lib/constants';
import InterventionModal from '@/components/form/InterventionModal';
import InterventionHistoryModal from '@/components/form/InterventionHistoryModal';

export default function MyRecordsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [historyPerson, setHistoryPerson] = useState<any>(null);

  useEffect(() => {
    const auth = checkAuth(['OSM']);
    if (!auth) { window.location.href = '/login'; return; }
    setUser(auth);
    
    // 👇 เติม || '' เพื่อแก้ Type String | null 👇
    fetchMyRecords(auth.username || '', auth.name || ''); 
  }, []);

  const fetchMyRecords = async (username: string, name: string) => {
    setIsLoading(true);
    try {
      let { data, error } = await supabase()
        .from('vulnerable_persons')
        .select('*, interventions(*)')
        .eq('created_by', username) 
        .order('created_at', { ascending: false });

      if (!data || data.length === 0) {
         const { data: dataByName } = await supabase()
          .from('vulnerable_persons')
          .select('*, interventions(*)')
          .eq('created_by', name) 
          .order('created_at', { ascending: false });
         data = dataByName;
      }

      if (!data || data.length === 0) {
        const { data: allData } = await supabase()
          .from('vulnerable_persons')
          .select('*, interventions(*)')
          .order('created_at', { ascending: false });
        data = allData;
      }

      if (data) setRecords(data);

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = records.filter((r: any) => 
    `${r.first_name} ${r.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 mt-6">
        
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="ค้นหาชื่อ..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-pink-400 shadow-sm" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-4xl mb-4">📂</p>
            <h3 className="text-lg font-bold text-slate-800 mb-2">ไม่พบข้อมูล</h3>
            <p className="text-slate-500 text-sm mb-6">คุณยังไม่ได้บันทึกข้อมูล หรือค้นหาไม่พบ</p>
            <button onClick={() => router.push('/person/new')} className="bg-pink-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-md hover:scale-105 transition-transform">
              + เพิ่มข้อมูลใหม่
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record: any) => (
              <div key={record.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{record.prefix}{record.first_name} {record.last_name}</h3>
                  <div className="flex flex-wrap gap-1.5 my-2">
                    {record.vulnerabilities?.map((v: string) => (
                      <span key={v} className="px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: VULN[v as VulnType]?.color }}>
                        {VULN[v as VulnType]?.label}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-4 h-4" /> {record.note || 'ไม่ระบุที่อยู่'}</p>
                  
                  {record.interventions && record.interventions.length > 0 && (
                    <p className="text-xs text-green-600 font-medium mt-2 bg-green-50 px-2 py-1 rounded inline-block">
                      ✅ ได้รับการช่วยเหลือแล้ว {record.interventions.length} ครั้ง
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 md:border-l md:pl-4">
                  {record.interventions && record.interventions.length > 0 && (
                    <button onClick={() => setHistoryPerson(record)} className="flex-1 md:flex-none p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 flex items-center justify-center transition-colors" title="ประวัติ">
                      <History className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={() => setSelectedPerson(record)} className="flex-1 md:flex-none p-2.5 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 flex items-center justify-center transition-colors" title="ช่วยเหลือ">
                    <Plus className="w-5 h-5" />
                  </button>
                  <button onClick={() => router.push(`/person/edit/${record.id}`)} className="flex-1 md:flex-none p-2.5 bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-100 flex items-center justify-center transition-colors" title="แก้ไข">
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPerson && (
        <InterventionModal 
          personId={selectedPerson.id} 
          personName={`${selectedPerson.first_name} ${selectedPerson.last_name}`} 
          staffCode={user.username || ''} 
          onClose={() => setSelectedPerson(null)} 
          onSuccess={() => fetchMyRecords(user.username || '', user.name || '')} 
        />
      )}
      
      {historyPerson && (
        <InterventionHistoryModal 
          person={historyPerson} 
          staffCode={user.username || ''} 
          onClose={() => setHistoryPerson(null)} 
          onRefresh={() => fetchMyRecords(user.username || '', user.name || '')} 
        />
      )}
    </main>
  );
}