'use client';
import { useState, useEffect } from 'react';
import { X, Check, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

interface Props {
  personId: string;
  personName: string;
  staffCode: string;
  editData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InterventionModal({ personId, personName, staffCode, editData, onClose, onSuccess }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [solutionType, setSolutionType] = useState('');
  const [agency, setAgency] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [aidCategory, setAidCategory] = useState('');
  const [aidQuantity, setAidQuantity] = useState('');
  const [aidUnit, setAidUnit] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editData) {
      setSolutionType(editData.solution_type || '');
      setAgency(editData.agency || '');
      setDate(editData.assistance_date || new Date().toISOString().split('T')[0]);
      setAidCategory(editData.aid_category || '');
      setAidQuantity(editData.aid_quantity?.toString() || '');
      setAidUnit(editData.aid_unit || '');
    }
  }, [editData]);

  const handleSubmit = async () => {
    if (!solutionType) return toast.error('กรุณาเลือกแนวทางแก้ไขปัญหา');
    if (solutionType === 'ช่วยเหลือ' && (!agency || !date)) return toast.error('กรุณาระบุหน่วยงานและวันที่');

    setIsSaving(true);
    try {
      const payload = {
        solution_type: solutionType,
        agency: solutionType === 'ช่วยเหลือ' ? agency : null,
        assistance_date: solutionType === 'ช่วยเหลือ' ? date : null,
        aid_category: solutionType === 'ช่วยเหลือ' ? aidCategory : null,
        aid_quantity: solutionType === 'ช่วยเหลือ' ? Number(aidQuantity) || null : null,
        aid_unit: solutionType === 'ช่วยเหลือ' ? aidUnit : null,
      };

      if (editData?.id) {
        const { error } = await supabase().from('interventions').update(payload).eq('id', editData.id);
        if (error) throw error;
        toast.success('แก้ไขข้อมูลสำเร็จ!');
      } else {
        const { error } = await supabase().from('interventions').insert([{
          ...payload,
          person_id: personId,
          created_by: staffCode,
        }]);
        if (error) throw error;
        toast.success('บันทึกการช่วยเหลือสำเร็จ!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  const executeDelete = async () => {
    setIsSaving(true);
    try {
      await supabase().from('interventions').delete().eq('id', editData.id);
      toast.success('ลบข้อมูลสำเร็จ');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('ไม่สามารถลบข้อมูลได้');
    } finally {
      setIsSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">{editData ? 'แก้ไขการช่วยเหลือ' : 'บันทึกการช่วยเหลือ'}</h2>
            <p className="text-xs text-pink-600">สำหรับ: {personName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">แนวทางการแก้ไขปัญหา</label>
            <select value={solutionType} onChange={e => setSolutionType(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-pink-400">
              <option value="">-- เลือกแนวทาง --</option>
              <option value="ให้คำแนะนำ">ให้คำแนะนำ</option>
              <option value="ช่วยเหลือ">ช่วยเหลือ</option>
              <option value="ประสานส่งต่อ">ประสานส่งต่อ</option>
            </select>
          </div>

          {solutionType === 'ช่วยเหลือ' && (
            <div className="space-y-4 pt-3 border-t animate-slide-up">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หน่วยงาน</label>
                <select value={agency} onChange={e => setAgency(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl outline-none">
                  <option value="">-- เลือกหน่วยงาน --</option>
                  <option value="เทศบาล">เทศบาล</option>
                  <option value="พม.">พม.</option>
                  <option value="ปภ.">ปภ.</option>
                  <option value="รพ.สต.">รพ.สต.</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">วันที่</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">สิ่งของ</label>
                  <input type="text" value={aidCategory} onChange={e => setAidCategory(e.target.value)} placeholder="เช่น ผ้าอ้อม" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">จำนวน</label>
                    <input type="number" value={aidQuantity} onChange={e => setAidQuantity(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl outline-none" />
                  </div>
                  <div className="w-20">
                    <label className="block text-sm font-medium text-slate-700 mb-1">หน่วย</label>
                    <input type="text" value={aidUnit} onChange={e => setAidUnit(e.target.value)} placeholder="ชุด" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 flex gap-2">
          {editData && (
            <button onClick={() => setShowDeleteConfirm(true)} className="p-3 bg-red-50 text-red-600 rounded-xl"><Trash2 className="w-5 h-5" /></button>
          )}
          <button onClick={onClose} className="flex-1 py-3 bg-white border rounded-xl font-medium text-slate-600">ยกเลิก</button>
          <button onClick={handleSubmit} disabled={isSaving} className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-bold flex justify-center items-center gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} บันทึก
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="absolute inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-[280px] text-center">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-lg mb-4">ยืนยันการลบ?</h3>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 bg-slate-100 rounded-xl">ยกเลิก</button>
                <button onClick={executeDelete} className="flex-1 py-2 bg-red-500 text-white rounded-xl">ลบ</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}