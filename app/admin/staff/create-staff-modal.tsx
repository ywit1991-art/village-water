'use client'

import { useActionState, useState, useEffect } from 'react'
import { createStaffAction } from '../actions'
import { X, Plus, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ROLE_LABELS } from '@/lib/auth/permissions'
import type { Village, WaterSystem } from '@/lib/types'

interface Props {
  villages: Village[]
  systems: WaterSystem[]
}

export default function CreateStaffModal({ villages, systems }: Props) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState('staff')
  const [selectedSystems, setSelectedSystems] = useState<number[]>([])
  const router = useRouter()
  const [state, formAction] = useActionState(createStaffAction, null)

  useEffect(() => {
    if (state?.ok) {
      toast.success('สร้างเจ้าหน้าที่แล้ว')
      setOpen(false)
      setRole('staff')
      setSelectedSystems([])
      router.refresh()
    }
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

  function toggleSystem(id: number) {
    setSelectedSystems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    )
  }

  // จัดกลุ่ม systems ตามหมู่บ้าน
  const groupedSystems = villages.map(v => ({
    village: v,
    systems: systems.filter(s => s.village_id === v.id),
  })).filter(g => g.systems.length > 0)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="เพิ่มเจ้าหน้าที่"
        title="เพิ่มเจ้าหน้าที่"
        className="inline-flex items-center justify-center gap-1.5 px-3 md:px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-medium text-sm transition"
      >
        <Plus size={18} />
        <span className="hidden md:inline">เพิ่มเจ้าหน้าที่</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            className="card w-full max-w-lg p-6 my-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-brand-900">เพิ่มเจ้าหน้าที่ใหม่</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form action={formAction} className="space-y-4">
              <div>
                <label className="label">รหัสเข้าใช้งาน *</label>
                <input
                  name="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  pattern="[0-9]{10}"
                  placeholder="XXXXXXXXXX"
                  className="input font-mono tracking-widest text-center text-lg"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">ชื่อ-สกุล *</label>
                <input
                  name="full_name"
                  required
                  className="input"
                  placeholder="เช่น นายสมชาย ใจดี"
                />
              </div>

              <div>
                <label className="label">สิทธิ์การใช้งาน *</label>
                <select
                  name="role"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="input"
                >
                  <option value="staff">{ROLE_LABELS.staff} — ดู/แก้ไขข้อมูลทั้งหมด</option>
                  <option value="village_head">{ROLE_LABELS.village_head} — เฉพาะหมู่ของตัวเอง</option>
                  <option value="operator">{ROLE_LABELS.operator} — เฉพาะข้อมูลที่ดูแล</option>
                  <option value="super_admin">{ROLE_LABELS.super_admin} — จัดการทุกอย่าง</option>
                </select>
              </div>

              {/* เลือกหมู่บ้าน (สำหรับ village_head) */}
              {role === 'village_head' && (
                <div>
                  <label className="label">หมู่บ้านที่รับผิดชอบ *</label>
                  <select name="village_id" required className="input">
                    <option value="">— เลือกหมู่บ้าน —</option>
                    {villages.map(v => (
                      <option key={v.id} value={v.id}>
                        หมู่ {v.village_no} {v.village_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* เลือกข้อมูล (สำหรับ operator) */}
              {role === 'operator' && (
                <div>
                  <label className="label">
                    ข้อมูลประปาที่ดูแล * ({selectedSystems.length} ข้อมูล)
                  </label>
                  <input
                    type="hidden"
                    name="system_ids"
                    value={selectedSystems.join(',')}
                  />
                  <div className="border border-brand-100 rounded-lg max-h-64 overflow-y-auto">
                    {groupedSystems.length === 0 ? (
                      <p className="p-4 text-center text-sm text-slate-400">
                        ยังไม่มีข้อมูลประปา
                      </p>
                    ) : (
                      groupedSystems.map(({ village, systems: sysList }) => (
                        <div key={village.id} className="border-b border-brand-50 last:border-0">
                          <div className="px-3 py-1.5 bg-brand-50/60 text-xs font-semibold text-brand-700">
                            หมู่ {village.village_no} {village.village_name}
                          </div>
                          {sysList.map(sys => (
                            <label
                              key={sys.id}
                              className="flex items-center gap-2 px-3 py-1.5 hover:bg-brand-50 cursor-pointer text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={selectedSystems.includes(sys.id)}
                                onChange={() => toggleSystem(sys.id)}
                                className="accent-brand-500"
                              />
                              <span>
                                ข้อมูลที่ {sys.system_no} — {sys.system_name}
                              </span>
                            </label>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {state?.error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">
                  {state.error}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-ghost flex-1"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary flex-1">
                  สร้างเจ้าหน้าที่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}