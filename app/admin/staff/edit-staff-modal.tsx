'use client'

import { useActionState, useState, useEffect } from 'react'
import { updateStaffAction } from '../actions'
import { X, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ROLE_LABELS } from '@/lib/auth/permissions'
import type { Village, WaterSystem } from '@/lib/types'

interface Props {
  staff: {
    id: number
    code: string
    full_name: string | null
    role: string
    village_id: number | null
    is_active: boolean
    system_ids: number[]
  }
  villages: Village[]
  systems: WaterSystem[]
}

export default function EditStaffModal({ staff, villages, systems }: Props) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState(staff.role)
  const [selectedSystems, setSelectedSystems] = useState<number[]>(staff.system_ids)
  const router = useRouter()
  const [state, formAction] = useActionState(updateStaffAction, null)

  useEffect(() => {
    if (state?.ok) {
      toast.success('อัปเดตแล้ว')
      setOpen(false)
      router.refresh()
    }
    if (state?.error) toast.error(state.error)
  }, [state, router])

  function toggleSystem(id: number) {
    setSelectedSystems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    )
  }

  const groupedSystems = villages
    .map(v => ({
      village: v,
      systems: systems.filter(s => s.village_id === v.id),
    }))
    .filter(g => g.systems.length > 0)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 text-xs font-medium"
        title="แก้ไข"
      >
        <Pencil size={12} /> แก้ไข
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div className="card w-full max-w-lg p-6 my-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-bold text-brand-900">แก้ไขเจ้าหน้าที่</h3>
                <p className="text-xs text-brand-500 mt-0.5 font-mono">
                  {staff.code} · {staff.full_name}
                </p>
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
              <input type="hidden" name="id" value={staff.id} />

              <div>
                <label className="label">ชื่อ-สกุล</label>
                <input
                  name="full_name"
                  defaultValue={staff.full_name ?? ''}
                  className="input"
                />
              </div>

              <div>
                <label className="label">สิทธิ์การใช้งาน</label>
                <select
                  name="role"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="input"
                >
                  <option value="staff">{ROLE_LABELS.staff}</option>
                  <option value="village_head">{ROLE_LABELS.village_head}</option>
                  <option value="operator">{ROLE_LABELS.operator}</option>
                  <option value="super_admin">{ROLE_LABELS.super_admin}</option>
                </select>
              </div>

              <div>
                <label className="label">สถานะการใช้งาน</label>
                <select
                  name="is_active"
                  defaultValue={String(staff.is_active)}
                  className="input"
                >
                  <option value="true">ใช้งาน</option>
                  <option value="false">ระงับการใช้งาน</option>
                </select>
              </div>

              {role === 'village_head' && (
                <div>
                  <label className="label">หมู่บ้านที่รับผิดชอบ</label>
                  <select
                    name="village_id"
                    defaultValue={staff.village_id ?? ''}
                    required
                    className="input"
                  >
                    <option value="">— เลือกหมู่บ้าน —</option>
                    {villages.map(v => (
                      <option key={v.id} value={v.id}>
                        หมู่ {v.village_no} {v.village_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {role === 'operator' && (
                <div>
                  <label className="label">
                    ระบบที่ดูแล ({selectedSystems.length} ระบบ)
                  </label>
                  <input
                    type="hidden"
                    name="system_ids"
                    value={selectedSystems.join(',')}
                  />
                  <div className="border border-brand-100 rounded-lg max-h-64 overflow-y-auto">
                    {groupedSystems.map(({ village, systems: sysList }) => (
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
                              ระบบที่ {sys.system_no} — {sys.system_name}
                            </span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {state?.error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">
                  {state.error}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1">
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary flex-1">
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}