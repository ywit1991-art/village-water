'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WelfareFormData } from '@/types/welfare';

interface Props {
  data: WelfareFormData;
  onChange: (data: WelfareFormData) => void;
}

const hardshipTypesOptions = ['คนไร้บ้าน', 'คนไร้สัญชาติ', 'ผู้สูงอายุที่ถูกทอดทิ้ง', 'ผู้ติดเชื้อ', 'ผู้ป่วยติดบ้าน/ติดเตียง', 'อดีตผู้ต้องขัง', 'คนพิการ', 'ผู้ได้รับผลกระทบจากภัยพิบัติ', 'เด็กกำพร้า', 'ผู้มีรายได้น้อย/ผู้ขัดสน', 'กลุ่มชาติพันธุ์'];
const hardshipCausesOptions = ['ยากจน/รายได้น้อย', 'มีหนี้สิน', 'ตกงาน/ไม่มีอาชีพ', 'ขาดผู้อุปการะ', 'ขาดความรู้ประกอบอาชีพ', 'ปัญหาครอบครัว', 'ไม่มีที่อยู่อาศัย', 'ถูกชักจูง/ล่อลวง', 'ไม่มีสถานะทางทะเบียน', 'ขาดโอกาสทางการศึกษา', 'เจ็บป่วยเรื้อรัง', 'ช่วยเหลือตนเองไม่ได้'];
const healthStatusOptions = ['ปกติ', 'ผู้สูงอายุ', 'เจ็บป่วย', 'พิการ', 'อื่นๆ'];
const governmentNeedsOptions = ['เข้าสถานสงเคราะห์', 'กลับภูมิลำเนา', 'ฝึกอาชีพ', 'หางานทำ', 'ที่พักชั่วคราว', 'เงินทุนประกอบอาชีพ', 'เงินสงเคราะห์ช่วยเหลือ', 'รักษาพยาบาล', 'ทำบัตรประชาชน'];
const communityNeedsOptions = ['ซ่อมแซมที่อยู่อาศัย', 'อาหาร', 'ฝึกอาชีพ', 'ให้งานทำ', 'ของใช้ในชีวิต', 'เครื่องนุ่งห่ม', 'เงินสงเคราะห์ช่วยเหลือ', 'วัสดุเพื่อการรักษาพยาบาล'];

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

export default function WelfareForm({ data, onChange }: Props) {
  const [openSection, setOpenSection] = useState<string | null>('hardship');

  const update = (field: keyof WelfareFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const toggleArrayItem = (field: keyof WelfareFormData, item: string) => {
    const list = (data[field] as string[]) || [];
    update(field, list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  return (
    <div className="space-y-2">
      
      {/* ส่วนที่ 1: สภาวะความยากลำบาก */}
      <Accordion id="hardship" title="ส่วนที่ 1: ประเภทและสาเหตุความยากลำบาก" openSection={openSection} setOpenSection={setOpenSection}>
        <div>
          <label className="text-sm font-medium mb-2 block">ประเภทของสภาวะความยากลำบาก (เลือกได้หลายข้อ)</label>
          <div className="grid grid-cols-2 gap-2">
            {hardshipTypesOptions.map(d => (
              <label key={d} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                <input type="checkbox" checked={data.hardshipTypes?.includes(d)} onChange={() => toggleArrayItem('hardshipTypes', d)} className="accent-pink-500" />
                <span className="text-sm">{d}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">สาเหตุของความยากลำบาก (เลือกได้หลายข้อ)</label>
          <div className="grid grid-cols-2 gap-2">
            {hardshipCausesOptions.map(d => (
              <label key={d} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                <input type="checkbox" checked={data.hardshipCauses?.includes(d)} onChange={() => toggleArrayItem('hardshipCauses', d)} className="accent-pink-500" />
                <span className="text-sm">{d}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">สถานะทางสุขภาพในปัจจุบัน</label>
          <div className="grid grid-cols-2 gap-2">
            {healthStatusOptions.map(h => (
              <label key={h} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                <input type="radio" name="healthStatus" checked={data.healthStatus === h} onChange={() => update('healthStatus', h)} className="accent-pink-500" />
                <span className="text-sm">{h}</span>
              </label>
            ))}
          </div>
          {data.healthStatus === 'พิการ' && (
            <input type="text" placeholder="ระบุลักษณะความพิการ..." value={data.healthStatusDetail} onChange={e => update('healthStatusDetail', e.target.value)} className="w-full mt-2 p-2.5 bg-slate-50 rounded-lg border" />
          )}
        </div>
      </Accordion>

      {/* ส่วนที่ 2: ความต้องการ */}
      <Accordion id="needs" title="ส่วนที่ 2: สิ่งที่ต้องการความช่วยเหลือ" openSection={openSection} setOpenSection={setOpenSection}>
        <div>
          <label className="text-sm font-medium mb-2 block">สิ่งที่ต้องการให้รัฐช่วยเหลือ</label>
          <div className="grid grid-cols-2 gap-2">
            {governmentNeedsOptions.map(n => (
              <label key={n} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                <input type="checkbox" checked={data.governmentNeeds?.includes(n)} onChange={() => toggleArrayItem('governmentNeeds', n)} className="accent-pink-500" />
                <span className="text-sm">{n}</span>
              </label>
            ))}
          </div>
          <input type="text" placeholder="ระบุความต้องการอื่นๆ จากรัฐ..." value={data.governmentNeedsDetail} onChange={e => update('governmentNeedsDetail', e.target.value)} className="w-full mt-2 p-2.5 bg-slate-50 rounded-lg border" />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">สิ่งที่ต้องการให้ชุมชน/องค์กรท้องถิ่นช่วยเหลือ</label>
          <div className="grid grid-cols-2 gap-2">
            {communityNeedsOptions.map(n => (
              <label key={n} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                <input type="checkbox" checked={data.communityNeeds?.includes(n)} onChange={() => toggleArrayItem('communityNeeds', n)} className="accent-pink-500" />
                <span className="text-sm">{n}</span>
              </label>
            ))}
          </div>
          <input type="text" placeholder="ระบุความต้องการอื่นๆ จากชุมชน..." value={data.communityNeedsDetail} onChange={e => update('communityNeedsDetail', e.target.value)} className="w-full mt-2 p-2.5 bg-slate-50 rounded-lg border" />
        </div>
      </Accordion>

      {/* ส่วนที่ 3: ประวัติการช่วยเหลือ */}
      <Accordion id="history" title="ส่วนที่ 3: ประวัติการได้รับความช่วยเหลือ" openSection={openSection} setOpenSection={setOpenSection}>
        <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer mb-3">
          <input type="checkbox" checked={data.hasReceivedHelp} onChange={e => update('hasReceivedHelp', e.target.checked)} className="accent-pink-500" />
          <span className="text-sm font-medium">เคยได้รับความช่วยเหลือจากหน่วยงานภาครัฐ</span>
        </label>

        {data.hasReceivedHelp && (
          <div className="space-y-3 pl-4 border-l-2 border-pink-200">
            <div>
              <label className="text-sm font-medium mb-1 block">ประเภทที่เคยได้รับ</label>
              <div className="flex gap-4">
                {['บริการ', 'เงิน', 'สิ่งของ'].map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={data.receivedHelpTypes?.includes(type)} onChange={() => toggleArrayItem('receivedHelpTypes', type)} className="accent-pink-500" />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">ปีที่ได้รับ</label>
                <input type="text" placeholder="เช่น 2565" value={data.receivedHelpYear} onChange={e => update('receivedHelpYear', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border" />
              </div>
              <div>
                <label className="text-sm font-medium">จากหน่วยงาน</label>
                <input type="text" placeholder="ระบุหน่วยงาน..." value={data.receivedHelpAgency} onChange={e => update('receivedHelpAgency', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border" />
              </div>
            </div>
          </div>
        )}
      </Accordion>

      {/* ส่วนที่ 4: สภาพเศรษฐกิจ */}
      <Accordion id="economy" title="ส่วนที่ 4: สภาพเศรษฐกิจ และประวัติเพิ่มเติม" openSection={openSection} setOpenSection={setOpenSection}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">รายรับ</label>
            <select value={data.incomeSufficiency} onChange={e => update('incomeSufficiency', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border mt-1">
              <option value="">เลือก...</option>
              <option value="ไม่เพียงพอ">ไม่เพียงพอ</option>
              <option value="เพียงพอ">เพียงพอ</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">รายจ่าย</label>
            <select value={data.expenseSufficiency} onChange={e => update('expenseSufficiency', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border mt-1">
              <option value="">เลือก...</option>
              <option value="ไม่เพียงพอ">ไม่เพียงพอ</option>
              <option value="เพียงพอ">เพียงพอ</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">หนี้สิน</label>
          <select value={data.debtStatus} onChange={e => update('debtStatus', e.target.value)} className="w-full p-2.5 bg-slate-50 rounded-lg border mt-1">
            <option value="">เลือก...</option>
            <option value="ไม่มี">ไม่มี</option>
            <option value="มีมากเกินรายได้">มีมากเกินรายได้</option>
            <option value="มีพอกับรายได้">มีพอกับรายได้</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">ประวัติส่วนตัว (เพิ่มเติม)</label>
          <textarea value={data.personalHistory} onChange={e => update('personalHistory', e.target.value)} rows={2} className="w-full p-2.5 bg-slate-50 rounded-lg border mt-1 resize-none" />
        </div>
        <div>
          <label className="text-sm font-medium">ประวัติครอบครัว</label>
          <textarea value={data.familyHistory} onChange={e => update('familyHistory', e.target.value)} rows={2} className="w-full p-2.5 bg-slate-50 rounded-lg border mt-1 resize-none" />
        </div>
      </Accordion>

    </div>
  );
}