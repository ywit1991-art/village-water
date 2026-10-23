'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DisabilityFormData } from '@/types/disability';

interface Props {
  data: DisabilityFormData;
  onChange: (data: DisabilityFormData) => void;
}

// ตัวเลือก
const diseaseOptions = ['ความดันโลหิตสูง', 'เบาหวาน', 'โรคหัวใจ', 'โรคหลอดเลือดสมอง', 'มะเร็ง', 'อื่นๆ'];
const welfareOptions = ['เบี้ยความพิการ', 'บัตรทอง', 'เงินสงเคราะห์', 'บัตรสวัสดิการแห่งรัฐ', 'อื่นๆ'];
const occupationOptions = ['เกษตรกรรม', 'ค้าขาย', 'รับจ้าง', 'ธุรกิจส่วนตัว', 'ไม่ได้ประกอบอาชีพ'];

// คำถาม ADL
const adlQuestions = [
  { id: 'q1', text: '1. การรับประทานอาหาร', options: [{ label: 'ไม่สามารถตักอาหารเข้าปากได้', score: 0 }, { label: 'ช่วยใช้ช้อนตักอาหารไว้ให้', score: 5 }, { label: 'ตักอาหารและช่วยตัวเองได้ปกติ', score: 10 }] },
  { id: 'q2', text: '2. การลุกนั่งจากที่นอน', options: [{ label: 'ไม่สามารถนั่งได้', score: 0 }, { label: 'ต้องการความช่วยเหลืออย่างมาก', score: 5 }, { label: 'ต้องการความช่วยเหลือบ้าง', score: 10 }, { label: 'ทำได้เอง', score: 15 }] },
  { id: 'q3', text: '3. การล้างหน้า แปรงฟัน', options: [{ label: 'ต้องการความช่วยเหลือ', score: 0 }, { label: 'ทำได้เอง', score: 5 }] },
  { id: 'q4', text: '4. การเข้าห้องน้ำ', options: [{ label: 'ช่วยตัวเองไม่ได้', score: 0 }, { label: 'ทำเองได้บ้าง', score: 5 }, { label: 'ช่วยตัวเองได้ดี', score: 10 }] },
  { id: 'q5', text: '5. การอาบน้ำ', options: [{ label: 'ต้องมีคนช่วย', score: 0 }, { label: 'อาบน้ำได้เอง', score: 5 }] },
  { id: 'q6', text: '6. การเคลื่อนที่ภายในห้อง/บ้าน', options: [{ label: 'เคลื่อนที่ไปไหนไม่ได้', score: 0 }, { label: 'ใช้รถเข็นช่วยตัวเอง', score: 5 }, { label: 'เดินโดยมีคนช่วย', score: 10 }, { label: 'เดินหรือเคลื่อนที่ได้เอง', score: 15 }] },
  { id: 'q7', text: '7. การขึ้นลงบันได 1 ขั้น', options: [{ label: 'ไม่สามารถทำได้', score: 0 }, { label: 'ต้องการคนช่วยเหลือ', score: 5 }, { label: 'ขึ้นลงได้เอง', score: 10 }] },
  { id: 'q8', text: '8. การสวมใส่เสื้อผ้า', options: [{ label: 'ต้องมีคนสวมใส่ให้', score: 0 }, { label: 'ช่วยตัวเองได้ 50%', score: 5 }, { label: 'ช่วยตัวเองได้ดี', score: 10 }] },
  { id: 'q9', text: '9. การกลั้นอุจจาระ (1 สัปดาห์)', options: [{ label: 'กลั้นไม่ได้', score: 0 }, { label: 'กลั้นไม่ได้บางครั้ง', score: 5 }, { label: 'กลั้นได้ปกติ', score: 10 }] },
  { id: 'q10', text: '10. การกลั้นปัสสาวะ (1 สัปดาห์)', options: [{ label: 'กลั้นไม่ได้/ใส่สายสวน', score: 0 }, { label: 'กลั้นไม่ได้บางครั้ง', score: 5 }, { label: 'กลั้นได้ปกติ', score: 10 }] },
];

// 👇 ย้าย Accordion มาประกาศไว้นอก Component หลัก 👇
const Accordion = ({ id, title, children, openSection, setOpenSection }: any) => (
  <div className="border border-slate-200 rounded-xl mb-3 overflow-hidden bg-white">
    <button
      type="button"
      onClick={() => setOpenSection(openSection === id ? null : id)}
      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors font-semibold text-slate-800"
    >
      {title}
      {openSection === id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
    </button>
    <AnimatePresence initial={false}>
      {openSection === id && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <div className="p-4 space-y-4 border-t border-slate-100">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default function DisabilityForm({ data, onChange }: Props) {
  const [openSection, setOpenSection] = useState<string | null>('basic');

  const update = (field: keyof DisabilityFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const toggleArrayItem = (field: keyof DisabilityFormData, item: string) => {
    const list = (data[field] as string[]) || [];
    update(field, list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleAdlChange = (qId: string, score: number) => {
    update('adlScores', { ...(data.adlScores || {}), [qId]: score });
  };

  const calculateAdlTotal = () => {
    return Object.values(data.adlScores || {}).reduce((sum, score) => sum + score, 0);
  };

  return (
    <div className="space-y-2">
      
      {/* ส่วนที่ 1 */}
      <Accordion id="basic" title="ส่วนที่ 1: ข้อมูลพื้นฐานและที่อยู่อาศัย" openSection={openSection} setOpenSection={setOpenSection}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">ชื่อเล่น</label>
            <input type="text" value={data.nickname} onChange={e => update('nickname', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border" />
          </div>
          <div>
            <label className="text-sm font-medium">สถานภาพสมรส</label>
            <select value={data.maritalStatus} onChange={e => update('maritalStatus', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border">
              <option value="">เลือก...</option>
              <option value="โสด">โสด</option>
              <option value="สมรส">สมรส</option>
              <option value="หม้าย">หม้าย/หย่าร้าง</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">การศึกษาสูงสุด</label>
            <select value={data.education} onChange={e => update('education', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border">
              <option value="">เลือก...</option>
              <option value="ประถมศึกษา">ประถมศึกษา</option>
              <option value="มัธยมศึกษา">มัธยมศึกษา</option>
              <option value="ปริญญาตรี">ปริญญาตรี</option>
              <option value="ไม่ได้เรียน">ไม่ได้เรียน</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">สภาพบ้าน</label>
            <select value={data.houseCondition} onChange={e => update('houseCondition', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border">
              <option value="">เลือก...</option>
              <option value="บ้านชั้นเดียว">บ้านชั้นเดียว</option>
              <option value="บ้านสองชั้น">บ้านสองชั้น</option>
              <option value="ตึกแถว">ตึกแถว</option>
            </select>
          </div>
        </div>
      </Accordion>

      {/* ส่วนที่ 2 */}
      <Accordion id="health" title="ส่วนที่ 2: ข้อมูลสุขภาพ" openSection={openSection} setOpenSection={setOpenSection}>
        <div>
          <label className="text-sm font-medium mb-2 block">โรคประจำตัว (เลือกได้หลายข้อ)</label>
          <div className="grid grid-cols-2 gap-2">
            {diseaseOptions.map(d => (
              <label key={d} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                <input type="checkbox" checked={data.congenitalDiseases?.includes(d)} onChange={() => toggleArrayItem('congenitalDiseases', d)} className="accent-pink-500" />
                <span className="text-sm">{d}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">อุปกรณ์ทางการแพทย์ที่ใช้</label>
          <input type="text" placeholder="เช่น รถเข็น, walker" value={data.medicalEquipment} onChange={e => update('medicalEquipment', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border" />
        </div>
      </Accordion>

      {/* ส่วนที่ 3 */}
      <Accordion id="disability" title="ส่วนที่ 3: ข้อมูลความพิการ" openSection={openSection} setOpenSection={setOpenSection}>
        <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer">
          <input type="checkbox" checked={data.isRegistered} onChange={e => update('isRegistered', e.target.checked)} className="accent-pink-500" />
          <span className="text-sm font-medium">จดทะเบียนคนพิการแล้ว (มีบัตร)</span>
        </label>
        <div>
          <label className="text-sm font-medium">ประเภทความพิการ (ตาม พรบ. 2550)</label>
          <select value={data.disabilityType} onChange={e => update('disabilityType', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border mt-1">
            <option value="">เลือก...</option>
            <option value="1. ทางการเห็น">1. ทางการเห็น</option>
            <option value="2. ทางการได้ยิน">2. ทางการได้ยินหรือสื่อความหมาย</option>
            <option value="3. ทางการเคลื่อนไหว">3. ทางการเคลื่อนไหวหรือทางร่างกาย</option>
            <option value="4. ทางจิตใจ">4. ทางจิตใจหรือพฤติกรรม</option>
            <option value="5. ทางสติปัญญา">5. ทางสติปัญญา</option>
            <option value="6. ทางการเรียนรู้">6. ทางการเรียนรู้</option>
            <option value="7. ทางออทิสติก">7. ทางออทิสติก</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">ระดับความพิการ</label>
          <select value={data.disabilityLevel} onChange={e => update('disabilityLevel', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border mt-1">
            <option value="">เลือก...</option>
            <option value="ช่วยเหลือตัวเองไม่ได้">ช่วยเหลือตัวเองไม่ได้เลย</option>
            <option value="ช่วยเหลือตัวเองได้บ้าง">ช่วยเหลือตัวเองได้บ้าง</option>
            <option value="ช่วยเหลือตัวเองได้">ช่วยเหลือตัวเองได้ปกติ</option>
          </select>
        </div>
      </Accordion>

      {/* ส่วนที่ 4 */}
      <Accordion id="caregiver" title="ส่วนที่ 4: ข้อมูลผู้ดูแล" openSection={openSection} setOpenSection={setOpenSection}>
        <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer">
          <input type="checkbox" checked={data.hasCaregiver} onChange={e => update('hasCaregiver', e.target.checked)} className="accent-pink-500" />
          <span className="text-sm font-medium">มีผู้ดูแลประจำ</span>
        </label>
        {data.hasCaregiver && (
          <div className="space-y-3 pt-2">
            <input type="text" placeholder="ชื่อ-นามสกุลผู้ดูแล" value={data.caregiverName} onChange={e => update('caregiverName', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border" />
            <input type="text" placeholder="ความสัมพันธ์ (เช่น บุตร, ญาติ)" value={data.caregiverRelation} onChange={e => update('caregiverRelation', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border" />
            <input type="tel" placeholder="เบอร์โทรผู้ดูแล" value={data.caregiverPhone} onChange={e => update('caregiverPhone', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border" />
          </div>
        )}
      </Accordion>

      {/* ส่วนที่ 5 */}
      <Accordion id="economy" title="ส่วนที่ 5: ข้อมูลเศรษฐกิจและสวัสดิการ" openSection={openSection} setOpenSection={setOpenSection}>
        <div>
          <label className="text-sm font-medium">อาชีพ (เลือกได้หลายข้อ)</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {occupationOptions.map(o => (
              <label key={o} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                <input type="checkbox" checked={data.occupations?.includes(o)} onChange={() => toggleArrayItem('occupations', o)} className="accent-pink-500" />
                <span className="text-sm">{o}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">รายได้ต่อเดือน</label>
          <select value={data.incomeLevel} onChange={e => update('incomeLevel', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border mt-1">
            <option value="">เลือก...</option>
            <option value="ไม่มีรายได้">ไม่มีรายได้</option>
            <option value="ต่ำกว่า 3,000">ต่ำกว่า 3,000 บาท</option>
            <option value="3,001-5,000">3,001 - 5,000 บาท</option>
            <option value="5,001-8,000">5,001 - 8,000 บาท</option>
            <option value="8,001 ขึ้นไป">8,001 บาทขึ้นไป</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">สวัสดิการที่ได้รับ</label>
          <div className="grid grid-cols-2 gap-2">
            {welfareOptions.map(w => (
              <label key={w} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                <input type="checkbox" checked={data.receivedWelfare?.includes(w)} onChange={() => toggleArrayItem('receivedWelfare', w)} className="accent-pink-500" />
                <span className="text-sm">{w}</span>
              </label>
            ))}
          </div>
        </div>
      </Accordion>

      {/* ส่วนที่ 6 (ADL) */}
      <Accordion id="adl" title="ส่วนที่ 6: การประเมินการช่วยเหลือตัวเอง (ADL)" openSection={openSection} setOpenSection={setOpenSection}>
        <div className="bg-pink-50 p-3 rounded-lg mb-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <span className="font-semibold text-pink-700">คะแนน ADL รวม:</span>
          <span className="text-2xl font-bold text-pink-700">{calculateAdlTotal()} / 100</span>
        </div>
        <div className="space-y-4">
          {adlQuestions.map((q) => (
            <div key={q.id} className="border-b pb-3 last:border-0">
              <p className="text-sm font-medium mb-2">{q.text}</p>
              <div className="space-y-1.5">
                {q.options.map((opt) => (
                  <label key={opt.label} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded">
                    <input 
                      type="radio" 
                      name={q.id} 
                      value={opt.score} 
                      checked={data.adlScores?.[q.id] === opt.score} 
                      onChange={() => handleAdlChange(q.id, opt.score)} 
                      className="accent-pink-500"
                    />
                    <span>{opt.label} ({opt.score} คะแนน)</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Accordion>

    </div>
  );
}