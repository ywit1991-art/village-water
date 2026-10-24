'use client';
import { Search, X, MapPin, HeartHandshake, Users, RotateCcw, LogOut } from 'lucide-react';
import { VULN, type VulnType } from '@/lib/constants';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  villageFilter: string;
  setVillageFilter: (val: string) => void;
  interventionFilter: string;
  setInterventionFilter: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  onClearFilters: () => void;
  onLogout: () => void;
}

export default function Header({
  searchQuery, setSearchQuery,
  villageFilter, setVillageFilter,
  interventionFilter, setInterventionFilter,
  typeFilter, setTypeFilter,
  onClearFilters,
  onLogout
}: HeaderProps) {
  return (
    <div className="w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-soft border border-white/60 flex flex-col overflow-hidden">
      
      {/* 👇 บรรทัดที่ 1: ช่องค้นหา (เต็มความกว้าง) + ปุ่ม */}
      <div className="flex items-center gap-2 p-2 md:p-3 border-b border-slate-100">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-pink-500 shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ นามสกุล..."
            className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1 rounded-full hover:bg-slate-200">
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={onClearFilters} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl" title="ล้างตัวกรอง">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={onLogout} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl" title="ออกจากระบบ">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 👇 บรรทัดที่ 2: ตัวกรอง 3 อัน (แบ่งเป็น 3 ช่องเท่ากัน ไม่มีทางล้น) */}
      <div className="grid grid-cols-3 gap-1.5 p-2 md:p-3 bg-slate-50/50 w-full">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-1.5 justify-center">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select value={villageFilter} onChange={(e) => setVillageFilter(e.target.value)} className="bg-transparent outline-none text-[10px] sm:text-xs text-slate-700 font-medium cursor-pointer w-full truncate appearance-none text-center">
            <option value="ALL">ทุกหมู่บ้าน</option>
            {Array.from({ length: 14 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>หมู่ {i + 1}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-1.5 justify-center">
          <HeartHandshake className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select value={interventionFilter} onChange={(e) => setInterventionFilter(e.target.value)} className="bg-transparent outline-none text-[10px] sm:text-xs text-slate-700 font-medium cursor-pointer w-full truncate appearance-none text-center">
            <option value="ALL">การช่วยเหลือ</option>
            <option value="none">ยังไม่ได้รับ</option>
            <option value="ให้คำแนะนำ">ให้คำแนะนำ</option>
            <option value="ช่วยเหลือ">ช่วยเหลือ</option>
            <option value="ประสานส่งต่อ">ประสานส่งต่อ</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-1.5 justify-center">
          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-transparent outline-none text-[10px] sm:text-xs text-slate-700 font-medium cursor-pointer w-full truncate appearance-none text-center">
            <option value="ALL">ทุกประเภท</option>
            {(Object.keys(VULN) as VulnType[]).map((key) => (
              <option key={key} value={key}>{VULN[key].label}</option>
            ))}
          </select>
        </div>
      </div>

    </div>
  );
}