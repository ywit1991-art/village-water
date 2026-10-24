'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import { checkAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Search, Loader2, Save, User, MapPin } from 'lucide-react';
import { VULN, type VulnType } from '@/lib/constants';

const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), { ssr: false });

export default function NewPersonPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  const [nationalId, setNationalId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [registryData, setRegistryData] = useState<any>(null);
  const [coords, setCoords] = useState({ lat: 19.1750, lng: 99.9150 });
  const [vulns, setVulns] = useState<Set<VulnType>>(new Set());
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const auth = checkAuth(['OSM']);
    if (!auth) { window.location.href = '/login'; return; }
    setUser(auth);
  }, []);

  const handleSearch = async () => {
    if (nationalId.length !== 13) return toast.error('กรุณากรอกเลขบัตร 13 หลัก');
    setIsSearching(true);
    try {
      const { data, error } = await supabase().from('registry_persons').select('*').eq('national_id', nationalId).single();
      if (error || !data) {
        toast.error('ไม่พบข้อมูลในทะเบียนราษฎร');
        setRegistryData(null);
      } else {
        setRegistryData(data);
        setNote(`บ้านเลขที่ ${data.house_no || '-'} หมู่ที่ ${data.village_no || '-'} ต.${data.subdistrict} อ.${data.district} จ.${data.province}`);
        toast.success('พบข้อมูลทะเบียนราษฎร');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async () => {
    if (!registryData) return toast.error('กรุณาค้นหาทะเบียนราษฎรก่อน');
    if (vulns.size === 0) return toast.error('กรุณาเลือกประเภทกลุ่มเปราะบาง');
    
    setIsSaving(true);
    try {
      const { error } = await supabase().from('vulnerable_persons').insert([{
        national_id: nationalId,
        prefix: registryData.prefix || null,
        first_name: registryData.first_name,
        last_name: registryData.last_name,
        birth_date: registryData.birth_date || null,
        latitude: coords.lat,
        longitude: coords.lng,
        note: note,
        vulnerabilities: Array.from(vulns),
        created_by: user.name, // หรือ user.staffCode ตามที่คุณตั้งไว้
      }]);

      if (error) throw error;
      toast.success('บันทึกข้อมูลสำเร็จ!');
      router.push('/person/my-records');
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 mt-6">
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">เพิ่มข้อมูลกลุ่มเปราะบาง</h1>
          <p className="text-pink-600 font-medium text-sm">เจ้าหน้าที่: {user.name} ({user.area})</p>
        </div>

        {/* 1. ค้นหา */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-4">
          <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs">1</span>
            ข้อมูลทะเบียนราษฎร
          </h2>
          <div className="flex gap-2">
            <input type="text" maxLength={13} value={nationalId} onChange={e => setNationalId(e.target.value.replace(/\D/g, ''))} placeholder="เลขบัตรประชาชน 13 หลัก" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-pink-400" />
            <button onClick={handleSearch} disabled={isSearching} className="bg-slate-800 text-white px-6 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-900 disabled:opacity-50">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} ค้นหา
            </button>
          </div>
          {registryData && (
            <div className="mt-4 bg-sky-50 rounded-xl p-4 border border-sky-100 text-sm">
              <p><span className="text-slate-500">ชื่อ:</span> <span className="font-bold text-slate-800">{registryData.first_name} {registryData.last_name}</span></p>
              <p><span className="text-slate-500">ที่อยู่:</span> {note}</p>
            </div>
          )}
        </div>

        {/* 2. พิกัด */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-4">
          <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs">2</span>
            พิกัดที่อยู่
          </h2>
          <LocationPicker position={coords} setPosition={setCoords} />
        </div>

        {/* 3. ประเภท */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-4">
          <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs">3</span>
            ประเภทกลุ่มเปราะบาง
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.keys(VULN) as VulnType[]).map(key => (
              <button key={key} onClick={() => {
                const newSet = new Set(vulns);
                newSet.has(key) ? newSet.delete(key) : newSet.add(key);
                setVulns(newSet);
              }} className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-2 ${vulns.has(key) ? 'border-transparent text-white shadow-md' : 'border-slate-100 bg-slate-50 text-slate-600'}`} style={vulns.has(key) ? { backgroundColor: VULN[key].color } : {}}>
                <span className="text-xl">{VULN[key].emoji}</span>
                <span className="text-sm font-medium">{VULN[key].label}</span>
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={isSaving} className="w-full h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-sky-500 text-white font-bold text-lg shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} บันทึกข้อมูล
        </button>
      </div>
    </main>
  );
}