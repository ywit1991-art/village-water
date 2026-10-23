'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Search, Loader2, ArrowLeft, Check, ImagePlus, X, ShieldCheck, List, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { VULN, type VulnType } from '@/lib/constants';
import { supabase } from '@/lib/supabase/client';
import DisabilityForm from '@/components/form/DisabilityForm';
import ElderlyForm from '@/components/form/ElderlyForm';
import WelfareForm from '@/components/form/WelfareForm';
import { DisabilityFormData } from '@/types/disability';
import { ElderlyFormData } from '@/types/elderly';
import { WelfareFormData } from '@/types/welfare';
import { getUsers } from '@/lib/auth';

const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse rounded-2xl" />,
});

export default function NewPersonPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [staffCode, setStaffCode] = useState('');
  const [osmArea, setOsmArea] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [nationalId, setNationalId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [registryData, setRegistryData] = useState<any>(null);
  const [coords, setCoords] = useState({ lat: 19.1750, lng: 99.9150 });
  
  const [vulns, setVulns] = useState<Set<VulnType>>(new Set());
  
  // 👇 เช็คให้ดีว่าใน Object นี้ไม่มี Key อะไรซ้ำกัน 👇
  const [disabilityData, setDisabilityData] = useState<DisabilityFormData>({
    nickname: '', maritalStatus: '', education: '', houseStatus: '', houseCondition: '', houseFacilities: [],
    congenitalDiseases: [], medicalRights: [], medicalEquipment: '', healthNeeds: '',
    isRegistered: false, disabilityType: '', disabilityCause: '', disabilityLevel: '', canCommunicate: false,
    hasCaregiver: false, caregiverName: '', caregiverRelation: '', caregiverPhone: '',
    occupations: [], incomeLevel: '', familyIncome: '', hasDebt: false, receivedWelfare: [], socialActivities: [], needsVocationalTraining: false,
    adlScores: {}, // 👈 มีแค่บรรทัดเดียว
  });

  const [elderlyData, setElderlyData] = useState<ElderlyFormData>({
    maritalStatus: '', occupation: '', communityActivity: '',
    weight: '', height: '', vision: '', hearing: '', selfRatedHealth: '',
    diseases: [], physicalProblems: [], exerciseHabit: '', smokingHabit: '', drinkingHabit: '',
    adlScores: {}, tgdsScores: {},
    hasFinancialSupport: false, hasCaregiverSupport: false, hasMentalSupport: false,
  });

  const [welfareData, setWelfareData] = useState<WelfareFormData>({
    hardshipTypes: [], hardshipCauses: [], healthStatus: '', healthStatusDetail: '',
    governmentNeeds: [], governmentNeedsDetail: '', communityNeeds: [], communityNeedsDetail: '',
    hasReceivedHelp: false, receivedHelpTypes: [], receivedHelpYear: '', receivedHelpAgency: '',
    incomeSufficiency: '', expenseSufficiency: '', debtStatus: '',
    personalHistory: '', familyHistory: '',
  });

  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const code = sessionStorage.getItem('staff_code');
    const role = sessionStorage.getItem('staff_role');
    if (!code || role !== 'OSM') {
      router.replace('/login');
      return;
    }
    setStaffCode(code);
    
    const users = getUsers();
    const currentUser = users.find(u => u.username === code);
    if (currentUser && currentUser.area) {
      setOsmArea(currentUser.area);
    }
    
    setIsAuthenticated(true);
  }, [router]);

  const handleSearchRegistry = async () => {
    if (nationalId.length !== 13) return toast.error('กรุณากรอกเลขบัตรประชาชน 13 หลัก');
    setIsSearching(true);
    try {
      const { data, error } = await supabase()
        .from('registry_persons')
        .select('*')
        .eq('national_id', nationalId)
        .single();

      if (error || !data) {
        toast.error('ไม่พบฐานข้อมูลบุคคลนี้ในตำบลท่าวังทอง');
        setRegistryData(null);
        return;
      }

      const areaNumber = osmArea.replace(/\D/g, ''); 
      
      if (areaNumber && parseInt(data.village_no) !== parseInt(areaNumber)) {
        toast.error(`บุคคลนี้ไม่ได้อยู่ในพื้นที่หมู่ที่ ${areaNumber} (บุคคลนี้อยู่หมู่ที่ ${data.village_no})`);
        setRegistryData(null);
        return;
      }

      const addressParts = [
        data.house_no ? `${data.house_no}` : '',
        data.soi ? `ซอย${data.soi}` : '',
        data.road ? `ถนน${data.road}` : '',
        data.village_no ? `หมู่ที่ ${data.village_no}` : '',
        data.subdistrict ? `ต.${data.subdistrict}` : '',
        data.district ? `อ.${data.district}` : '',
        data.province ? `จ.${data.province}` : ''
      ].filter(Boolean);

      setRegistryData({
        prefix: '', 
        first_name: data.first_name, 
        last_name: data.last_name,
        birth_date: data.birth_date,
        address: addressParts.join(' '),
        house_code: data.house_code, 
        status: data.status,
      });
      toast.success('ดึงข้อมูลทะเบียนราษฎรสำเร็จ');
      
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (photos.length + files.length > 3) return toast.error('อัปโหลดได้สูงสุด 3 รูป');
    setPhotos((prev) => [...prev, ...Array.from(files).map((file) => URL.createObjectURL(file))]);
  };

  const toggleVuln = (type: VulnType) => {
    setVulns((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (nationalId.length !== 13) return toast.error('กรุณากรอกเลขบัตรประชาชน 13 หลัก');
    if (!registryData) return toast.error('กรุณากดปุ่ม "ค้นหา" ทะเบียนราษฎร เพื่อยืนยันตัวตนก่อนบันทึก');
    if (vulns.size === 0) return toast.error('กรุณาเลือกประเภทกลุ่มเปราะบางอย่างน้อย 1 ประเภท');
    
    if (phone.trim() !== '') {
      const isMobile = /^(06|08|09)/.test(phone);
      if (isMobile && phone.length !== 10) return toast.error('เบอร์มือถือต้องมี 10 หลัก');
      if (!isMobile && phone.length !== 9) return toast.error('เบอร์บ้านต้องมี 9 หลัก');
    }

    setIsSearching(true);
    try {
      const { error } = await supabase().from('vulnerable_persons').insert([{
        national_id: nationalId, 
        prefix: registryData?.prefix || null,
        first_name: registryData?.first_name, 
        last_name: registryData?.last_name,
        birth_date: registryData?.birth_date || null, 
        phone: phone,
        latitude: coords.lat, 
        longitude: coords.lng, 
        photo_urls: photos,
        note: note, 
        vulnerabilities: Array.from(vulns), 
        created_by: staffCode,
        disability_type: disabilityData.disabilityType || null,
        disability_profile: vulns.has('DISABLED') ? disabilityData : null,
        elderly_profile: vulns.has('ELDERLY') ? elderlyData : null,
        welfare_profile: (vulns.has('LOW_INCOME') || vulns.has('BEDRIDDEN') || vulns.has('PREGNANT')) ? welfareData : null,
      }]);

      if (error) throw error;
      
      toast.success('บันทึกข้อมูลสำเร็จ! พร้อมสำหรับกรอกคนถัดไป');
      
      setNationalId('');
      setRegistryData(null);
      setVulns(new Set());
      
      // รีเซ็ตค่าฟอร์ม
      setDisabilityData({
        nickname: '', maritalStatus: '', education: '', houseStatus: '', houseCondition: '', houseFacilities: [],
        congenitalDiseases: [], medicalRights: [], medicalEquipment: '', healthNeeds: '',
        isRegistered: false, disabilityType: '', disabilityCause: '', disabilityLevel: '', canCommunicate: false,
        hasCaregiver: false, caregiverName: '', caregiverRelation: '', caregiverPhone: '',
        occupations: [], incomeLevel: '', familyIncome: '', hasDebt: false, receivedWelfare: [], socialActivities: [], needsVocationalTraining: false,
        adlScores: {}, // 👈 มีแค่บรรทัดเดียว
      });
      setElderlyData({
        maritalStatus: '', occupation: '', communityActivity: '',
        weight: '', height: '', vision: '', hearing: '', selfRatedHealth: '',
        diseases: [], physicalProblems: [], exerciseHabit: '', smokingHabit: '', drinkingHabit: '',
        adlScores: {}, tgdsScores: {},
        hasFinancialSupport: false, hasCaregiverSupport: false, hasMentalSupport: false,
      });
      setWelfareData({
        hardshipTypes: [], hardshipCauses: [], healthStatus: '', healthStatusDetail: '',
        governmentNeeds: [], governmentNeedsDetail: '', communityNeeds: [], communityNeedsDetail: '',
        hasReceivedHelp: false, receivedHelpTypes: [], receivedHelpYear: '', receivedHelpAgency: '',
        incomeSufficiency: '', expenseSufficiency: '', debtStatus: '',
        personalHistory: '', familyHistory: '',
      });
      setPhone('');
      setNote('');
      setPhotos([]);
      setCoords({ lat: 19.1750, lng: 99.9150 });

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error: any) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSearching(false);
    }
  };

  if (!isAuthenticated) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>;

  return (
    <main className="min-h-screen bg-gradient-soft pb-20">
      <div className="sticky top-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-white/60">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 p-0.5 shrink-0 hidden sm:block">
               <Image src="/logo.png" alt="logo" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg">เพิ่มข้อมูลกลุ่มเปราะบาง</h1>
              <p className="text-[11px] text-pink-600 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> เจ้าหน้าที่: {staffCode} {osmArea && `(${osmArea})`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.push('/person/my-records')} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-full text-xs font-medium transition-colors"
            >
              <List className="w-3.5 h-3.5" /> รายการที่ฉันบันทึก
            </button>
            <button 
              onClick={() => { sessionStorage.clear(); router.replace('/'); }} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" /> ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4 mt-2">
        <section className="bg-white rounded-3xl p-5 shadow-soft border border-white/60">
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs">1</span>
            ข้อมูลทะเบียนราษฎร
          </h2>
          <div className="flex gap-2">
            <input type="text" inputMode="numeric" maxLength={13} value={nationalId} onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))} placeholder="เลขบัตรประชาชน 13 หลัก" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-pink-400" />
            <button onClick={handleSearchRegistry} disabled={isSearching || nationalId.length !== 13} className="bg-slate-800 text-white px-5 rounded-xl font-medium disabled:opacity-50 flex items-center gap-2">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} ค้นหา
            </button>
          </div>
          {registryData && (
            <div className="mt-4 bg-sky-50 rounded-xl p-4 border border-sky-100 text-sm space-y-1.5 animate-slide-up">
              <p><span className="text-slate-500">ชื่อ-สกุล:</span> <span className="font-semibold text-slate-800">{registryData.prefix}{registryData.first_name} {registryData.last_name}</span></p>
              <p><span className="text-slate-500">วันเกิด:</span> {new Date(registryData.birth_date).toLocaleDateString('th-TH')}</p>
              <p><span className="text-slate-500">ที่อยู่:</span> {registryData.address}</p>
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl p-5 shadow-soft border border-white/60">
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs">2</span> พิกัดบ้าน
          </h2>
          <LocationPicker position={coords} setPosition={setCoords} />
        </section>

        <section className="bg-white rounded-3xl p-5 shadow-soft border border-white/60">
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs">3</span> ข้อมูลกลุ่มเปราะบาง
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ประเภท (เลือกได้หลายข้อ) <span className="text-pink-500">*</span></label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(Object.keys(VULN) as VulnType[]).map((key) => {
                  const meta = VULN[key]; const isActive = vulns.has(key);
                  return (
                    <button key={key} type="button" onClick={() => toggleVuln(key)} className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${isActive ? 'border-transparent text-white shadow-md' : 'border-slate-100 bg-slate-50 text-slate-600'}`} style={isActive ? { backgroundColor: meta.color } : undefined}>
                      <span className="text-xl">{meta.emoji}</span><span className="text-sm font-medium flex-1">{meta.label}</span>{isActive && <Check className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {vulns.has('DISABLED') && (
              <div className="mt-6 border-t pt-4">
                <DisabilityForm data={disabilityData} onChange={setDisabilityData} />
              </div>
            )}
            
            {vulns.has('ELDERLY') && (
              <div className="mt-6 border-t pt-4">
                <ElderlyForm data={elderlyData} onChange={setElderlyData} />
              </div>
            )}
            
            {(vulns.has('LOW_INCOME') || vulns.has('BEDRIDDEN') || vulns.has('PREGNANT')) && (
              <div className="mt-6 border-t pt-4">
                <WelfareForm data={welfareData} onChange={setWelfareData} />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
              <input type="tel" value={phone} onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                const isMobile = /^(06|08|09)/.test(digits);
                if (digits.length <= (isMobile ? 10 : 9)) setPhone(digits);
              }} maxLength={/^(06|08|09)/.test(phone) ? 10 : 9} placeholder="0812345678" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-pink-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุ</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-pink-400 resize-none" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-5 shadow-soft border border-white/60">
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs">4</span> รูปถ่าย (สูงสุด 3 รูป)
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {photos.map((url, i) => (
              <div key={i} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-slate-200">
                <img src={url} alt="preview" className="w-full h-full object-cover" />
                <button onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center text-white"><X className="w-3 h-3" /></button>
              </div>
            ))}
            {photos.length < 3 && (
              <button onClick={() => fileInputRef.current?.click()} className="w-24 h-24 shrink-0 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-pink-400 hover:text-pink-500">
                <ImagePlus className="w-6 h-6 mb-1" /><span className="text-xs font-medium">เพิ่มรูป</span>
              </button>
            )}
            <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
          </div>
        </section>

        <button 
          onClick={handleSubmit} 
          disabled={isSearching || !registryData || vulns.size === 0} 
          className="w-full h-14 rounded-2xl bg-gradient-brand text-white font-bold text-lg shadow-glow hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-6 h-6" />}
          ยืนยันบันทึกข้อมูล
        </button>
      </div>
    </main>
  );
}