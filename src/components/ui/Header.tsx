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
    <div className="absolute top-0 left-0 right-0 z-[9999] p-4 pointer-events-none w-full">
      <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-xl rounded-2xl px-3 py-2 shadow-soft border border-white/60 w-full overflow-x-auto hide-scrollbar">
        
        {/* 1. ช่องค้นหา */}
        <div className="flex items-center gap-2 min-w-[200px] flex-1 px-2 border-r border-slate-200">
          <Search className="w-5 h-5 text-pink-500 shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ นามสกุล..."
            className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1 rounded-full hover:bg-slate-100">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* 2. ตัวกรองหมู่บ้าน */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
          <MapPin className="w-4 h-4 text-slate-400" />
          <select
            value={villageFilter}
            onChange={(e) => setVillageFilter(e.target.value)}
            className="bg-transparent outline-none text-sm text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">ทุกหมู่บ้าน</option>
            {Array.from({ length: 14 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>หมู่ {i + 1}</option>
            ))}
          </select>
        </div>

        {/* 3. ตัวกรองการช่วยเหลือ */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
          <HeartHandshake className="w-4 h-4 text-slate-400" />
          <select
            value={interventionFilter}
            onChange={(e) => setInterventionFilter(e.target.value)}
            className="bg-transparent outline-none text-sm text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">การช่วยเหลือทั้งหมด</option>
            <option value="none">ยังไม่ได้รับความช่วยเหลือ</option>
            <option value="ให้คำแนะนำ">ให้คำแนะนำ</option>
            <option value="ช่วยเหลือ">ให้ความช่วยเหลือ</option>
            <option value="ประสานส่งต่อ">ประสานส่งต่อ</option>
          </select>
        </div>

        {/* 4. ตัวกรองประเภท */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
          <Users className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-transparent outline-none text-sm text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">ทุกประเภท</option>
            {(Object.keys(VULN) as VulnType[]).map((key) => (
              <option key={key} value={key}>{VULN[key].label}</option>
            ))}
          </select>
        </div>

        {/* ปุ่มล้างตัวกรอง */}
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 px-3 py-2 shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors"
          title="ล้างตัวกรองทั้งหมด"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">ล้างค่า</span>
        </button>

        {/* ปุ่มออกจากระบบ */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-2 shrink-0 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors ml-1"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">ออกจากระบบ</span>
        </button>

      </div>
    </div>
  );
}