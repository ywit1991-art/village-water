'use client'

import { useActionState, useState, useEffect } from 'react'
import { updateWaterSystemAction } from '../actions'
import { X, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { WaterSystem } from '@/lib/types'

interface Props {
  system: WaterSystem
}

export default function EditSystemModal({ system }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [state, formAction] = useActionState(updateWaterSystemAction, null)

  useEffect(() => {
    if (state?.ok) {
      toast.success('อัปเดตแล้ว')
      setOpen(false)
      router.refresh()
    }
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-brand-600 hover:text-brand-800 text-xs font-medium"
        title="แก้ไขชื่อ/พิกัด"
      >
        แก้ไขระบบ
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="card w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-brand-900">แก้ไขระบบประปา</h3>
                <p className="text-xs text-brand-500 mt-0.5">ระบบที่ {system.system_no}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="id" value={system.id} />

              <div>
                <label className="label">ชื่อระบบประปา *</label>
                <input
                  name="system_name"
                  required
                  defaultValue={system.system_name}
                  className="input"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">ละติจูด</label>
                  <input
                    name="lat"
                    type="number"
                    step="any"
                    defaultValue={system.lat ?? ''}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">ลองจิจูด</label>
                  <input
                    name="lng"
                    type="number"
                    step="any"
                    defaultValue={system.lng ?? ''}
                    className="input"
                  />
                </div>
              </div>

              {state?.error && (
                <p className="text-sm text-red-500">{state.error}</p>
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