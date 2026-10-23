'use client';
import { useState, useEffect } from 'react';
import { X, Check, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
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
  const [photo, setPhoto] = useState<File | null>(null);
  
  // 👇 State สำหรับสิ่งของ 👇
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
    if (solutionType === 'ช่วยเหลือ' && (!agency || !date)) {
      return toast.error('กรุณาระบุหน่วยงานและวันที่ให้ความช่วยเหลือ');
    }

    setIsSaving(true);
    try {
      let photoUrl = editData?.photo_url || null;
      if (photo) photoUrl = URL.createObjectURL(photo); 

      const payload = {
        solution_type: solutionType,
        agency: solutionType === 'ช่วยเหลือ' ? agency : null,
        assistance_date: solutionType === 'ช่วยเหลือ' ? date : null,
        photo_url: photoUrl,
        // 👇 บันทึกข้อมูลสิ่งของ 👇
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
      const { error } = await supabase().from('interventions').delete().eq('id', editData.id);
      if (error) throw error;
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 p-0.5 shrink-0">
               <Image src="/logo.png" alt="logo" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">{editData ? 'แก้ไขการช่วยเหลือ' : 'บันทึกการช่วยเหลือ'}</h2>
              <p className="text-xs text-pink-600">สำหรับ: {personName}</p>
            </div>
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
            <div className="space-y-4 pt-3 border-t">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หน่วยงานที่ให้การช่วยเหลือ</label>
                <select value={agency} onChange={e => setAgency(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-pink-400">
                  <option value="">-- เลือกหน่วยงาน --</option>
                  <option value="เทศบาล">เทศบาล</option>
                  <option value="พม.">พม. (พัฒนาสังคมฯ)</option>
                  <option value="ปภ.">ปภ. (ป้องกันภัยฯ)</option>
                  <option value="รพ.สต.">รพ.สต.</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">วันที่ให้ความช่วยเหลือ</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-pink-400" />
              </div>
              
              {/* 👇 ช่องกรอกสิ่งของ 👇 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทสิ่งของ</label>
                  <select value={aidCategory} onChange={e => setAidCategory(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl outline-none">
                    <option value="">-- เลือก --</option>
                    <option value="ยาและเวชภัณฑ์">ยาและเวชภัณฑ์</option>
                    <option value="เครื่องนุ่งห่ม">เครื่องนุ่งห่ม</option>
                    <option value="อาหารและเครื่องดื่ม">อาหารและเครื่องดื่ม</option>
                    <option value="อุปกรณ์การแพทย์">อุปกรณ์การแพทย์</option>
                    <option value="การซ่อมแซมที่อยู่อาศัย">การซ่อมแซมที่อยู่อาศัย</option>
                    <option value="ผ้าอ้อม">ผ้าอ้อม</option>
                    <option value="แขน/ขาเทียม">แขน/ขาเทียม</option>
                    <option value="เครื่องช่วยฟัง">เครื่องช่วยฟัง</option>
                    <option value="รถเข็น">รถเข็น</option>
                    <option value="เตียงผู้ป่วย">เตียงผู้ป่วย</option>
                    <option value="ทุนการศึกษา">ทุนการศึกษา</option>
                    <option value="เงินสงเคราะห์">เงินสงเคราะห์</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">จำนวน</label>
                    <input type="number" value={aidQuantity} onChange={e => setAidQuantity(e.target.value)} placeholder="5" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" />
                  </div>
                  <div className="w-20">
                    <label className="block text-sm font-medium text-slate-700 mb-1">หน่วย</label>
                    <input type="text" value={aidUnit} onChange={e => setAidUnit(e.target.value)} placeholder="ชุด" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">แนบภาพถ่าย (1 รูป)</label>
                <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 flex gap-2">
          {editData && (
            <button onClick={() => setShowDeleteConfirm(true)} disabled={isSaving} className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors" title="ลบข้อมูล">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={onClose} className="flex-1 py-3 bg-white border rounded-xl font-medium text-slate-600 hover:bg-slate-100">ยกเลิก</button>
          <button onClick={handleSubmit} disabled={isSaving} className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-medium shadow-glow flex items-center justify-center gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} บันทึก
          </button>
        </div>

        {/* Custom Confirm Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-[280px] text-center mx-4 animate-slide-up">
              <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">ยืนยันการลบ</h3>
              <p className="text-slate-500 text-sm mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบประวัตินี้?</p>
              
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium">ยกเลิก</button>
                <button onClick={executeDelete} disabled={isSaving} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium flex justify-center items-center gap-1">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ลบข้อมูล'}
                </button>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}