'use client';
import { useState } from 'react';
import { X, Calendar, Building2, Edit } from 'lucide-react';
import Image from 'next/image';
import InterventionModal from './InterventionModal';

interface Props {
  person: any;
  staffCode: string;
  onClose: () => void;
  onRefresh: () => void;
}

export default function InterventionHistoryModal({ person, staffCode, onClose, onRefresh }: Props) {
  const [editingData, setEditingData] = useState<any>(null);

  if (editingData) {
    return (
      <InterventionModal
        personId={person.id}
        personName={`${person.first_name} ${person.last_name}`}
        staffCode={staffCode}
        editData={editingData}
        onClose={() => setEditingData(null)}
        onSuccess={() => { onRefresh(); setEditingData(null); }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* 👇 Header พร้อมโลโก้ 👇 */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 p-0.5 shrink-0">
               <Image src="/logo.png" alt="logo" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">ประวัติการช่วยเหลือ</h2>
              <p className="text-xs text-pink-600">ของ: {person.prefix}{person.first_name} {person.last_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
          {(!person.interventions || person.interventions.length === 0) ? (
            <div className="text-center py-10 text-slate-400">
              <p>ยังไม่มีประวัติการช่วยเหลือ</p>
            </div>
          ) : (
            person.interventions.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((inv: any) => (
              <div key={inv.id} className="border border-slate-100 rounded-2xl p-4 bg-white hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    inv.solution_type === 'ช่วยเหลือ' ? 'bg-pink-100 text-pink-700' :
                    inv.solution_type === 'ให้คำแนะนำ' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {inv.solution_type}
                  </span>
                  <button onClick={() => setEditingData(inv)} className="p-2 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors" title="แก้ไข">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                
                {inv.solution_type === 'ช่วยเหลือ' && (
                  <div className="space-y-1.5 mt-3 text-sm text-slate-600">
                    <p className="flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" /> หน่วยงาน: {inv.agency || '-'}</p>
                    <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> วันที่: {inv.assistance_date ? new Date(inv.assistance_date).toLocaleDateString('th-TH') : '-'}</p>
                    {inv.photo_url && (
                      <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border">
                        <img src={inv.photo_url} alt="evidence" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
                <p className="text-[10px] text-slate-400 mt-3 text-right">บันทึกเมื่อ: {new Date(inv.created_at).toLocaleString('th-TH')}</p>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t bg-white shrink-0">
           <button onClick={onClose} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">ปิดหน้าต่าง</button>
        </div>
      </div>
    </div>
  );
}