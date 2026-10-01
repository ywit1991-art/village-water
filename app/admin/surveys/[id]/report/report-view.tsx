'use client'

import { Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type {
  Survey,
  Village,
  WaterSystem,
  CommitteeMember,
  Pump,
  Signature,
  WaterRateTier,
} from '@/lib/types'
import { STATUS_EMOJI } from '@/lib/constants'

interface Props {
  survey: Survey
  village: Village
  system: WaterSystem | null
}

// ========================================
// Helpers
// ========================================
function fmt(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—'
  return String(v)
}

function dateFmt(v: string | null | undefined): string {
  if (!v) return '—'
  try {
    const d = new Date(v)
    if (isNaN(d.getTime())) return v
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return v
  }
}

// ========================================
// Sub-components
// ========================================
function Section({
  num,
  title,
  children,
  long = false,
}: {
  num: number
  title: string
  children: React.ReactNode
  long?: boolean
}) {
  return (
    <section
      className={`report-section ${long ? 'long-section' : ''}`}
      data-section={num}
    >
      <h2 className="text-base font-bold text-slate-900 bg-slate-100 border-l-4 border-slate-800 px-3 py-1.5 mb-3">
        {num}. {title}
      </h2>
      <div className="space-y-1.5 pl-1">{children}</div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 leading-relaxed">
      <span className="report-field-label">{label}:</span>
      <span className="report-field-value">{value}</span>
    </div>
  )
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-semibold text-slate-800 mt-2 mb-1">{children}</p>
  )
}

// ========================================
// Main Report
// ========================================
export default function ReportView({
  survey: s,
  village: v,
  system: sys,
}: Props) {
  const committee: CommitteeMember[] = Array.isArray(s.committee_members)
    ? s.committee_members
    : []
  const pumps: Pump[] = Array.isArray(s.pumps) ? s.pumps : []
  const signatures: Signature[] = Array.isArray(s.signatures)
    ? s.signatures
    : []
  const waterRateTiers: WaterRateTier[] = Array.isArray(s.water_rate_tiers)
    ? s.water_rate_tiers
    : []
  const photos = (s.photos ?? []).filter((u): u is string => !!u)
  const problems = (s.problems ?? []).filter((p): p is string => !!p)
  const improvements = (s.improvements ?? []).filter((p): p is string => !!p)

  const SIGN_ROLES = [
    'ผู้ให้ข้อมูล/ผู้แทนคณะกรรมการ',
    'เจ้าหน้าที่ผู้ตรวจสอบ (กองช่าง ทต.ท่าวังทอง)',
    'ผู้ตรวจสอบ/ผู้ร่วมตรวจ',
  ]

  // ⭐ ตรวจสอบว่าใช้ขั้นบันไดหรือไม่
  const isTiered =
    s.water_rate_type === 'tiered' && waterRateTiers.length > 0

  return (
    <>
      {/* ============ TOOLBAR (ซ่อนตอนพิมพ์) ============ */}
      <div className="print:hidden sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[21cm] mx-auto px-3 md:px-4 py-3 flex items-center justify-between gap-2">
          <Link
            href="/admin/dashboard"
            aria-label="กลับแดชบอร์ด"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium active:scale-95 transition shrink-0"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">กลับแดชบอร์ด</span>
          </Link>
          <button
            onClick={() => window.print()}
            aria-label="พิมพ์รายงาน"
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-medium text-xs md:text-sm shadow-sm transition"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">พิมพ์รายงาน / บันทึก PDF</span>
            <span className="sm:hidden">พิมพ์</span>
          </button>
        </div>
      </div>

      {/* ============ REPORT ============ */}
      <div className="report-page bg-white mx-auto my-3 md:my-6 px-4 md:px-10 py-6 md:py-8 shadow-lg max-w-[21cm] print:shadow-none print:my-0 print:px-0 print:py-0">
        {/* -------- หัวรายงาน -------- */}
        <header className="text-center mb-6 border-b-2 border-slate-800 pb-3">
          <img
            src="/logo.png"
            alt="ตราเทศบาล"
            className="w-16 h-16 mx-auto mb-1"
          />
          <h1 className="text-lg font-bold leading-tight">
            แบบตรวจสอบข้อมูลประปาหมู่บ้าน
          </h1>
          <p className="text-sm text-slate-600">
            เทศบาลตำบลท่าวังทอง อำเภอเมืองพะเยา จังหวัดพะเยา
          </p>
          <p className="text-xs text-slate-500 mt-1">
            แบบรายงานผล ณ วันที่ {dateFmt(s.survey_date)}
          </p>
        </header>

        {/* -------- 1. ข้อมูลทั่วไป -------- */}
        <Section num={1} title="ข้อมูลทั่วไป">
          <Row
            label="ชื่อข้อมูลประปา"
            value={fmt(s.water_system_name ?? sys?.system_name)}
          />
          <Row
            label="หมู่ที่ / หมู่บ้าน"
            value={`หมู่ ${v.village_no} ${v.village_name}`}
          />
          <Row
            label="ตำบล / อำเภอ / จังหวัด"
            value={`${v.tambon} · ${v.amphoe} · ${v.province}`}
          />
          <Row
            label="หน่วยงาน/กลุ่มที่รับผิดชอบ"
            value={fmt(s.group_name)}
          />
          <Row label="สถานที่ตั้ง" value={fmt(s.location)} />
          <Row
            label="พิกัด (ละติจูด, ลองจิจูด)"
            value={s.lat && s.lng ? `${s.lat}, ${s.lng}` : '—'}
          />
        </Section>

        {/* -------- 2. คณะกรรมการ (long) -------- */}
        <Section num={2} title="คณะกรรมการบริหารกิจการประปา" long>
          <Row
            label="คำสั่งแต่งตั้งเลขที่"
            value={fmt(s.committee_order_no)}
          />
          <Row label="ลงวันที่" value={dateFmt(s.committee_order_date)} />
          <Row
            label="วันเริ่มปฏิบัติหน้าที่"
            value={dateFmt(s.committee_start_date)}
          />
          <Row
            label="วาระ"
            value={s.committee_term ? `${s.committee_term} ปี` : '—'}
          />
          <Row label="สถานะคณะกรรมการ" value={fmt(s.committee_status)} />

          {committee.length > 0 && (
            <>
              <SubTitle>รายชื่อคณะกรรมการ ({committee.length} คน)</SubTitle>
              <table className="w-full text-sm border-collapse mt-1">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-2 py-1 w-10 text-center">
                      #
                    </th>
                    <th className="border border-slate-300 px-2 py-1 text-left">
                      ชื่อ-สกุล
                    </th>
                    <th className="border border-slate-300 px-2 py-1 w-32 text-left">
                      ตำแหน่ง
                    </th>
                    <th className="border border-slate-300 px-2 py-1 w-32 text-left">
                      โทรศัพท์
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {committee.map((m, i) => (
                    <tr key={i}>
                      <td className="border border-slate-300 px-2 py-1 text-center">
                        {i + 1}
                      </td>
                      <td className="border border-slate-300 px-2 py-1">
                        {fmt(m.name)}
                      </td>
                      <td className="border border-slate-300 px-2 py-1">
                        {fmt(m.position)}
                      </td>
                      <td className="border border-slate-300 px-2 py-1">
                        {fmt(m.phone)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </Section>

        {/* -------- 3. ช่างประปา -------- */}
        <Section num={3} title="ผู้รับผิดชอบ / ช่างประปา">
          <Row label="ชื่อ-สกุล" value={fmt(s.operator_name)} />
          <Row label="ตำแหน่ง/หน้าที่" value={fmt(s.operator_position)} />
          <Row label="เบอร์โทรศัพท์" value={fmt(s.operator_phone)} />
          <Row
            label="ระยะเวลาปฏิบัติหน้าที่"
            value={s.operator_years != null ? `${s.operator_years} ปี` : '—'}
          />
          <Row label="หน้าที่รับผิดชอบ" value={fmt(s.operator_duties)} />
        </Section>

        {/* -------- 4. แหล่งน้ำดิบ -------- */}
        <Section num={4} title="ข้อมูลแหล่งน้ำดิบ">
          <Row label="ประเภทแหล่งน้ำ" value={fmt(s.water_source_type)} />
          <Row label="ชื่อแหล่งน้ำ" value={fmt(s.water_source_name)} />
          <Row
            label="ระยะห่างจากข้อมูลผลิต"
            value={
              s.water_source_distance != null
                ? `${s.water_source_distance} ม.`
                : '—'
            }
          />
          <Row
            label="พิกัดแหล่งน้ำ"
            value={
              s.water_source_lat && s.water_source_lng
                ? `${s.water_source_lat}, ${s.water_source_lng}`
                : '—'
            }
          />
          <Row label="สภาพแหล่งน้ำ" value={fmt(s.water_source_condition)} />
          <Row label="ความเพียงพอ" value={fmt(s.water_source_sufficiency)} />
          <Row
            label="รายละเอียด/ข้อสังเกต"
            value={fmt(s.water_source_notes)}
          />
        </Section>

        {/* -------- 5. สูบน้ำ (long) -------- */}
        <Section num={5} title="ข้อมูลสูบน้ำ" long>
          <Row label="ประเภทเครื่องสูบน้ำ" value={fmt(s.pump_types)} />
          <Row
            label="จำนวนเครื่อง"
            value={s.pump_count != null ? `${s.pump_count} เครื่อง` : '—'}
          />
          {pumps.length > 0 && (
            <>
              <SubTitle>รายละเอียดเครื่องสูบน้ำ</SubTitle>
              <table className="w-full text-sm border-collapse mt-1">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-2 py-1 w-10 text-center">
                      #
                    </th>
                    <th className="border border-slate-300 px-2 py-1 text-left">
                      ยี่ห้อ/รุ่น
                    </th>
                    <th className="border border-slate-300 px-2 py-1 w-24 text-left">
                      ขนาด (HP)
                    </th>
                    <th className="border border-slate-300 px-2 py-1 w-20 text-left">
                      อายุ (ปี)
                    </th>
                    <th className="border border-slate-300 px-2 py-1 text-left">
                      สภาพ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pumps.map((p, i) => (
                    <tr key={i}>
                      <td className="border border-slate-300 px-2 py-1 text-center">
                        {i + 1}
                      </td>
                      <td className="border border-slate-300 px-2 py-1">
                        {[p.brand, p.model].filter(Boolean).join(' / ') || '—'}
                      </td>
                      <td className="border border-slate-300 px-2 py-1">
                        {fmt(p.hp)}
                      </td>
                      <td className="border border-slate-300 px-2 py-1">
                        {fmt(p.age)}
                      </td>
                      <td className="border border-slate-300 px-2 py-1">
                        {fmt(p.condition)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </Section>

        {/* -------- 6. ไฟฟ้า -------- */}
        <Section num={6} title="ข้อมูลไฟฟ้าและตู้ควบคุม">
          <Row label="ข้อมูลไฟฟ้า" value={fmt(s.electrical_phase)} />
          <Row label="เลขมิเตอร์ไฟฟ้า" value={fmt(s.electrical_meter_no)} />
          <Row label="สภาพตู้ควบคุม" value={fmt(s.control_box_condition)} />
          <Row label="อื่น ๆ" value={fmt(s.control_box_other)} />
          <Row
            label="สภาพสายไฟ/อุปกรณ์"
            value={fmt(s.electrical_wiring_condition)}
          />
          <Row label="ข้อสังเกต" value={fmt(s.electrical_notes)} />
        </Section>

        {/* -------- 7. ข้อมูลผลิต -------- */}
        <Section num={7} title="ข้อมูลข้อมูลผลิตน้ำประปา">
          <Row label="ประเภทข้อมูลผลิต" value={fmt(s.production_type)} />
          <Row label="อื่น ๆ" value={fmt(s.production_other)} />
          <Row label="ข้อมูลกรองน้ำ" value={fmt(s.has_filter)} />
          <Row label="ประเภท/วัสดุกรอง" value={fmt(s.filter_type)} />
          <Row label="สภาพข้อมูลกรอง" value={fmt(s.filter_condition)} />
          <Row label="ข้อมูลฆ่าเชื้อ/เติมคลอรีน" value={fmt(s.chlorination)} />
        </Section>

        {/* -------- 8. ถังเก็บน้ำ -------- */}
        <Section num={8} title="ถังเก็บน้ำ / ถังสูง">
          <Row label="ประเภทถัง" value={fmt(s.tank_types)} />
          <Row label="อื่น ๆ" value={fmt(s.tank_other)} />
          <Row
            label="จำนวนถัง"
            value={s.tank_count != null ? `${s.tank_count} ถัง` : '—'}
          />
          <Row
            label="ความจุรวม"
            value={s.tank_capacity != null ? `${s.tank_capacity} ลบ.ม.` : '—'}
          />
          <Row label="สภาพถัง" value={fmt(s.tank_condition)} />
          <Row label="สภาพพื้นที่โดยรอบ" value={fmt(s.tank_surrounding)} />
          <Row label="ข้อสังเกต" value={fmt(s.tank_notes)} />
        </Section>

        {/* -------- 9. ท่อส่งน้ำ -------- */}
        <Section num={9} title="ข้อมูลท่อส่งน้ำและจ่ายน้ำ">
          <Row label="วัสดุท่อ" value={fmt(s.pipe_materials)} />
          <Row label="อื่น ๆ" value={fmt(s.pipe_other)} />
          <Row label="ขนาดท่อเมน" value={fmt(s.pipe_main_size)} />
          <Row
            label="ความยาวท่อรวม"
            value={
              s.pipe_total_length != null
                ? `${s.pipe_total_length} ม.`
                : '—'
            }
          />
          <Row label="สภาพท่อ" value={fmt(s.pipe_condition)} />
          <Row label="พื้นที่ที่มีปัญหา" value={fmt(s.problem_areas)} />
        </Section>

        {/* -------- 10. ผู้ใช้น้ำ -------- */}
        <Section num={10} title="ข้อมูลผู้ใช้น้ำ">
          <Row label="ครัวเรือนในพื้นที่" value={s.household_count ?? '—'} />
          <Row label="ผู้ใช้น้ำทั้งหมด" value={s.user_count ?? '—'} />
          <Row label="มีมิเตอร์" value={s.metered_user_count ?? '—'} />
          <Row label="ไม่มีมิเตอร์" value={s.unmetered_user_count ?? '—'} />
          <Row label="ทะเบียนผู้ใช้น้ำ" value={fmt(s.has_user_registry)} />
        </Section>

        {/* -------- 11. บริหารจัดการ (มี tiers) -------- */}
        <Section num={11} title="การบริหารจัดการกิจการประปา" long={isTiered}>
          <Row label="ระเบียบ/ข้อบังคับ" value={fmt(s.has_regulations)} />
          <Row
            label="การประชุมคณะกรรมการ"
            value={fmt(s.meeting_frequency)}
          />
          <Row
            label="บัญชีรายรับ-รายจ่าย"
            value={fmt(s.has_financial_books)}
          />
          <Row label="บัญชีเงินฝาก" value={fmt(s.has_bank_account)} />
          <Row label="การจัดเก็บค่าน้ำ" value={fmt(s.has_fee_collection)} />

          {/* ⭐ แสดงอัตราค่าน้ำ — tiered */}
          {isTiered ? (
            <>
              <SubTitle>
                อัตราค่าน้ำแบบขั้นบันได ({waterRateTiers.length} ขั้น)
              </SubTitle>
              <table className="w-full text-sm border-collapse mt-1">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-2 py-1 w-12 text-center">
                      ลำดับ
                    </th>
                    <th className="border border-slate-300 px-2 py-1 text-left">
                      ช่วงหน่วย
                    </th>
                    <th className="border border-slate-300 px-2 py-1 w-32 text-right">
                      บาท/หน่วย
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {waterRateTiers.map((tier, i) => (
                    <tr key={i}>
                      <td className="border border-slate-300 px-2 py-1 text-center">
                        {i + 1}
                      </td>
                      <td className="border border-slate-300 px-2 py-1">
                        {tier.from} – {tier.to ?? 'ไม่จำกัด'} หน่วย
                      </td>
                      <td className="border border-slate-300 px-2 py-1 text-right">
                        {tier.rate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <Row
              label="อัตราค่าน้ำ"
              value={
                s.water_rate != null
                  ? `${s.water_rate} บาท/หน่วย`
                  : '—'
              }
            />
          )}

          <Row label="เงินค้างชำระ" value={fmt(s.has_debt)} />
          <Row label="หมายเหตุ" value={fmt(s.debt_notes)} />
        </Section>

        {/* -------- 12. บำรุงรักษา (long) -------- */}
        <Section num={12} title="การบำรุงรักษาข้อมูล" long>
          <Row label="มีการบำรุงรักษา" value={fmt(s.has_maintenance)} />
          {s.maintenance_items &&
            Object.keys(s.maintenance_items).length > 0 && (
              <>
                <SubTitle>รายการบำรุงรักษา</SubTitle>
                <table className="w-full text-sm border-collapse mt-1">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 px-2 py-1 text-left">
                        รายการ
                      </th>
                      <th className="border border-slate-300 px-2 py-1 w-20 text-center">
                        สถานะ
                      </th>
                      <th className="border border-slate-300 px-2 py-1 w-1/4 text-left">
                        หมายเหตุ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(s.maintenance_items).map(
                      ([item, val]) => (
                        <tr key={item}>
                          <td className="border border-slate-300 px-2 py-1">
                            {item}
                          </td>
                          <td className="border border-slate-300 px-2 py-1 text-center">
                            {fmt(val?.status)}
                          </td>
                          <td className="border border-slate-300 px-2 py-1">
                            {fmt(val?.note)}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </>
            )}
        </Section>

        {/* -------- 13. คุณภาพน้ำ -------- */}
        <Section num={13} title="คุณภาพน้ำประปา">
          <Row
            label="ลักษณะน้ำที่ได้รับ"
            value={fmt(s.water_quality_appearance)}
          />
          <Row label="อื่น ๆ" value={fmt(s.water_quality_other)} />
          <Row
            label="การตรวจสอบคุณภาพ"
            value={fmt(s.has_quality_test)}
          />
          <Row
            label="ตรวจครั้งล่าสุด"
            value={dateFmt(s.last_quality_test_date)}
          />
          <Row
            label="ผลการตรวจ/ข้อสังเกต"
            value={fmt(s.quality_test_result)}
          />
        </Section>

        {/* -------- 14. ปัญหา -------- */}
        <Section num={14} title="ปัญหาและข้อเสนอแนะจากการตรวจสอบ">
          <SubTitle>ปัญหาที่พบ ({problems.length})</SubTitle>
          {problems.length > 0 ? (
            <ol className="list-decimal pl-6 space-y-1">
              {problems.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          ) : (
            <p className="text-slate-500">— ไม่ระบุ —</p>
          )}

          <SubTitle>
            จุดที่ควรแก้ไข/ปรับปรุง ({improvements.length})
          </SubTitle>
          {improvements.length > 0 ? (
            <ol className="list-decimal pl-6 space-y-1">
              {improvements.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          ) : (
            <p className="text-slate-500">— ไม่ระบุ —</p>
          )}

          <SubTitle>ข้อเสนอแนะคณะกรรมการ</SubTitle>
          <p className="whitespace-pre-wrap pl-1">
            {fmt(s.committee_suggestions)}
          </p>
        </Section>

        {/* -------- 15. สรุป -------- */}
        <Section num={15} title="สรุปผลการตรวจสอบ">
          <Row
            label="สภาพโดยรวม"
            value={
              s.overall_condition
                ? `${STATUS_EMOJI[s.overall_condition] ?? ''} ${s.overall_condition}`
                : '—'
            }
          />
          <SubTitle>สรุปผล</SubTitle>
          <p className="whitespace-pre-wrap pl-1">{fmt(s.summary)}</p>
        </Section>

        {/* -------- 16. ภาพถ่าย (long) -------- */}
        <Section num={16} title="ภาพถ่ายประกอบการตรวจสอบ" long>
          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 mt-1">
              {photos.map((url, i) => (
                <div key={i} className="text-center">
                  <img
                    src={url}
                    alt={`ภาพที่ ${i + 1}`}
                    className="w-full h-32 object-cover border border-slate-300"
                  />
                  <p className="text-xs text-slate-500 mt-0.5">
                    ภาพที่ {i + 1}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">— ไม่มีภาพถ่าย —</p>
          )}
        </Section>

        {/* -------- 17. รับรอง -------- */}
        <Section num={17} title="การรับรองข้อมูล">
          <p className="mb-4 leading-relaxed">
            ข้าพเจ้าขอรับรองว่าข้อมูลที่ให้ไว้ในแบบตรวจสอบข้อมูลประปาหมู่บ้านฉบับนี้
            เป็นข้อมูลตามสภาพข้อเท็จจริงที่สามารถตรวจสอบได้
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6 signature-block">
            {signatures.map((sig, i) => (
              <div
                key={i}
                className="text-center text-sm signature-block"
              >
                <p className="font-medium mb-8">
                  ลงชื่อ ..............................................
                </p>
                <p className="font-semibold">
                  {sig.name || '(.................................)'}
                </p>
                <p className="text-xs text-slate-600">{SIGN_ROLES[i]}</p>
                {sig.position && (
                  <p className="text-xs text-slate-600">
                    ตำแหน่ง: {sig.position}
                  </p>
                )}
                {sig.date && (
                  <p className="text-xs text-slate-500 mt-1">
                    วันที่: {dateFmt(sig.date)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* -------- Footer -------- */}
        <footer className="mt-8 pt-3 border-t border-slate-300 text-center text-xs text-slate-500">
          <p>
            เอกสารนี้พิมพ์จากข้อมูลฐานข้อมูลประปาหมู่บ้าน เทศบาลตำบลท่าวังทอง
          </p>
          <p className="mt-0.5">
            พิมพ์เมื่อ {new Date().toLocaleString('th-TH')}
          </p>
        </footer>
      </div>
    </>
  )
}