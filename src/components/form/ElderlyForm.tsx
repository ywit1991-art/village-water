'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ElderlyFormData } from '@/types/elderly';

interface Props {
  data: ElderlyFormData;
  onChange: (data: ElderlyFormData) => void;
}

const diseaseOptions = ['ความดันโลหิตสูง', 'เบาหวาน', 'โรคหัวใจ', 'หลอดเลือดสมอง', 'ข้อเข่าเสื่อม', 'สมองเสื่อม'];
const problemOptions = ['หกล้ม', 'กลั้นปัสสาวะไม่ได้', 'ท้องผูก', 'นอนไม่หลับ', 'ปัญหาการได้ยิน', 'ปัญหาการมองเห็น'];

// คำถาม ADL (Barthel Index)
const adlQuestions = [
  { id: 'q1', text: '1. การรับประทานอาหาร', options: [{ label: 'ทำไม่ได้ (ต้องป้อน)', score: 0 }, { label: 'ทำได้บ้าง (ต้องช่วย)', score: 1 }, { label: 'ทำได้เอง', score: 2 }] },
  { id: 'q2', text: '2. การล้างหน้า แปรงฟัน', options: [{ label: 'ต้องการคนช่วย', score: 0 }, { label: 'ทำได้เอง', score: 1 }] },
  { id: 'q3', text: '3. การลุกนั่งจากเตียง', options: [{ label: 'ทำไม่ได้', score: 0 }, { label: 'ต้องช่วยมาก', score: 1 }, { label: 'ต้องช่วยบ้าง', score: 2 }, { label: 'ทำได้เอง', score: 3 }] },
  { id: 'q4', text: '4. การเข้าห้องน้ำ', options: [{ label: 'ทำไม่ได้', score: 0 }, { label: 'ทำได้บ้าง', score: 1 }, { label: 'ทำได้เอง', score: 2 }] },
  { id: 'q5', text: '5. การเคลื่อนที่ในบ้าน', options: [{ label: 'ทำไม่ได้', score: 0 }, { label: 'ใช้รถเข็น', score: 1 }, { label: 'เดินมีคนช่วย', score: 2 }, { label: 'เดินได้เอง', score: 3 }] },
  { id: 'q6', text: '6. การสวมใส่เสื้อผ้า', options: [{ label: 'ทำไม่ได้', score: 0 }, { label: 'ทำได้ครึ่งเดียว', score: 1 }, { label: 'ทำได้เอง', score: 2 }] },
  { id: 'q7', text: '7. การขึ้นลงบันได', options: [{ label: 'ทำไม่ได้', score: 0 }, { label: 'ต้องมีคนช่วย', score: 1 }, { label: 'ทำได้เอง', score: 2 }] },
  { id: 'q8', text: '8. การอาบน้ำ', options: [{ label: 'ต้องมีคนช่วย', score: 0 }, { label: 'อาบน้ำได้เอง', score: 1 }] },
];

// คำถาม TGDS (ภาวะซึมเศร้า 15 ข้อ - ตอบ "ใช่" ได้ 1 คะแนน, ตอบ "ไม่ใช่" ได้ 0 คะแนน)
const tgdsQuestions = [
  'ท่านพอใจกับชีวิตความเป็นอยู่ตอนนี้หรือไม่?',
  'ท่านรู้สึกเบื่อหน่ายกับกิจกรรมที่เคยทำหรือไม่?',
  'ท่านรู้สึกว่าชีวิตท่านช่วงนี้ว่างเปล่าหรือไม่?',
  'ท่านรู้สึกเบื่อหน่ายบ่อยๆ หรือไม่?',
  'ท่านหวังว่าจะมีสิ่งดีๆ เกิดขึ้นในวันหน้าหรือไม่?',
  'ท่านมีเรื่องกังวลตลอดเวลาหรือไม่?',
  'ส่วนใหญ่แล้วท่านรู้สึกอารมณ์ดีหรือไม่?',
  'ท่านรู้สึกกลัวว่าจะมีเรื่องไม่ดีเกิดขึ้นหรือไม่?',
  'ส่วนใหญ่ท่านรู้สึกมีความสุขหรือไม่?',
  'ท่านรู้สึกไม่มีที่พึ่งหรือไม่?',
  'ท่านรู้สึกกระวนกระวาย กระสับกระส่ายบ่อยๆ หรือไม่?',
  'ท่านชอบอยู่กับบ้านมากกว่าออกนอกบ้านหรือไม่?',
  'บ่อยครั้งที่ท่านรู้สึกวิตกกังวลเกี่ยวกับชีวิตข้างหน้าหรือไม่?',
  'ท่านคิดว่าความจำท่านไม่ดีเท่ากับคนอื่นหรือไม่?',
  'การที่มีชีวิตอยู่ถึงปัจจุบันนี้เป็นเรื่องที่น่ายินดีหรือไม่?'
];

// Accordion Component
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

export default function ElderlyForm({ data, onChange }: Props) {
  const [openSection, setOpenSection] = useState<string | null>('basic');

  const update = (field: keyof ElderlyFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const toggleArrayItem = (field: keyof ElderlyFormData, item: string) => {
    const list = (data[field] as string[]) || [];
    update(field, list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const calculateAdlTotal = () => {
    return Object.values(data.adlScores || {}).reduce((sum, score) => sum + score, 0);
  };

  const calculateTgdsTotal = () => {
    // คำนวณเฉพาะข้อที่ตอบ "ใช่" (ตามแบบประเมินภาษาไทย)
    return Object.values(data.tgdsScores || {}).filter(score => score === 1).length;
  };

  return (
    <div className="space-y-2">
      
      {/* ส่วนที่ 1 */}
      <Accordion id="basic" title="ส่วนที่ 1: ข้อมูลทั่วไป" openSection={openSection} setOpenSection={setOpenSection}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">สถานภาพสมรส</label>
            <select value={data.maritalStatus} onChange={e => update('maritalStatus', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border mt-1">
              <option value="">เลือก...</option>
              <option value="โสด">โสด</option>
              <option value="คู่">คู่</option>
              <option value="หม้าย">หม้าย</option>
              <option value="หย่า/แยก">หย่า/แยก</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">อาชีพปัจจุบัน</label>
            <select value={data.occupation} onChange={e => update('occupation', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border mt-1">
              <option value="">เลือก...</option>
              <option value="ไม่ได้ทำงาน">ไม่ได้ทำงาน</option>
              <option value="ทำงานบ้าน">ทำงานบ้าน</option>
              <option value="เกษตรกรรม">เกษตรกรรม</option>
              <option value="ค้าขาย/ธุรกิจ">ค้าขาย/ธุรกิจ</option>
            </select>
          </div>
        </div>
      </Accordion>

      {/* ส่วนที่ 2 */}
      <Accordion id="physical" title="ส่วนที่ 2: สุขภาพกาย" openSection={openSection} setOpenSection={setOpenSection}>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-sm font-medium">น้ำหนัก (กก.)</label>
            <input type="number" value={data.weight} onChange={e => update('weight', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border" />
          </div>
          <div>
            <label className="text-sm font-medium">ส่วนสูง (ซม.)</label>
            <input type="number" value={data.height} onChange={e => update('height', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border" />
          </div>
          <div>
            <label className="text-sm font-medium">การมองเห็น</label>
            <select value={data.vision} onChange={e => update('vision', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border mt-1">
              <option value="เห็นชัดเจน">เห็นชัดเจน</option>
              <option value="เห็นไม่ชัด">เห็นไม่ชัด</option>
              <option value="ไม่เห็น">ไม่เห็น</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">โรคประจำตัว (เลือกได้หลายข้อ)</label>
          <div className="grid grid-cols-2 gap-2">
            {diseaseOptions.map(d => (
              <label key={d} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                <input type="checkbox" checked={data.diseases?.includes(d)} onChange={() => toggleArrayItem('diseases', d)} className="accent-pink-500" />
                <span className="text-sm">{d}</span>
              </label>
            ))}
          </div>
        </div>
      </Accordion>

      {/* ส่วนที่ 3: ADL */}
      <Accordion id="adl" title="ส่วนที่ 3: ความสามารถในการปฏิบัติกิจวัตรประจำวัน (ADL)" openSection={openSection} setOpenSection={setOpenSection}>
        <div className="bg-pink-50 p-3 rounded-lg mb-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <span className="font-semibold text-pink-700">คะแนน ADL รวม:</span>
          <span className="text-2xl font-bold text-pink-700">{calculateAdlTotal()} / 16</span>
        </div>
        <div className="space-y-4">
          {adlQuestions.map((q) => (
            <div key={q.id} className="border-b pb-3 last:border-0">
              <p className="text-sm font-medium mb-2">{q.text}</p>
              <div className="space-y-1.5">
                {q.options.map((opt) => (
                  <label key={opt.label} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded">
                    <input type="radio" name={q.id} value={opt.score} checked={data.adlScores?.[q.id] === opt.score} onChange={() => update('adlScores', { ...(data.adlScores || {}), [q.id]: opt.score })} className="accent-pink-500" />
                    <span>{opt.label} ({opt.score} คะแนน)</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      {/* ส่วนที่ 4: TGDS */}
      <Accordion id="mental" title="ส่วนที่ 4: สุขภาพจิต (ประเมินภาวะซึมเศร้า)" openSection={openSection} setOpenSection={setOpenSection}>
        <div className="bg-sky-50 p-3 rounded-lg mb-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <span className="font-semibold text-sky-700">คะแนนภาวะซึมเศร้า:</span>
          <span className="text-2xl font-bold text-sky-700">{calculateTgdsTotal()} / 15</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">* ในช่วง 1 สัปดาห์ที่ผ่านมา ท่านรู้สึกอย่างไรกับข้อความต่อไปนี้</p>
        <div className="space-y-3">
          {tgdsQuestions.map((q, idx) => (
            <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
              <span className="text-sm flex-1 pr-4">{idx + 1}. {q}</span>
              <div className="flex gap-3 shrink-0">
                <label className="flex items-center gap-1 text-sm cursor-pointer">
                  <input type="radio" name={`tgds_${idx}`} checked={data.tgdsScores?.[idx] === 1} onChange={() => update('tgdsScores', { ...(data.tgdsScores || {}), [idx]: 1 })} className="accent-pink-500" />
                  ใช่
                </label>
                <label className="flex items-center gap-1 text-sm cursor-pointer">
                  <input type="radio" name={`tgds_${idx}`} checked={data.tgdsScores?.[idx] === 0} onChange={() => update('tgdsScores', { ...(data.tgdsScores || {}), [idx]: 0 })} className="accent-pink-500" />
                  ไม่ใช่
                </label>
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      {/* ส่วนที่ 5 */}
      <Accordion id="social" title="ส่วนที่ 5: สุขภาพสังคม" openSection={openSection} setOpenSection={setOpenSection}>
        <div className="space-y-3">
          <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer">
            <input type="checkbox" checked={data.hasFinancialSupport} onChange={e => update('hasFinancialSupport', e.target.checked)} className="accent-pink-500" />
            <span className="text-sm font-medium">มีแหล่งสนับสนุนด้านการเงิน (เช่น บุตร, เบี้ยยังชีพ)</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer">
            <input type="checkbox" checked={data.hasCaregiverSupport} onChange={e => update('hasCaregiverSupport', e.target.checked)} className="accent-pink-500" />
            <span className="text-sm font-medium">มีผู้ดูแลหลักเมื่อเจ็บป่วย</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer">
            <input type="checkbox" checked={data.hasMentalSupport} onChange={e => update('hasMentalSupport', e.target.checked)} className="accent-pink-500" />
            <span className="text-sm font-medium">มีคนที่สามารถปรึกษาพูดคุยเรื่องกังวลใจได้</span>
          </label>
        </div>
      </Accordion>

    </div>
  );
}