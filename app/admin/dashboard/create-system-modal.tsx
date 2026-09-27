'use client'

import { useActionState, useState, useEffect } from 'react'
import { createWaterSystemAction } from '../actions'
import { X, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  villageId: number
  villageName: string
}

export default function CreateSystemModal({ villageId, villageName }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [state, formAction] = useActionState(createWaterSystemAction, null)

  useEffect(() => {
    if (state?.id) {
      toast.success('สร้างระบบใหม่แล้ว')
      setOpen(false)
      router.push(`/admin/surveys/new?village=${villageId}&system=${state.id}`)
      router.refresh()
    }
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router, villageId])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 font-medium text-sm"
      >
        <Plus size={14} /> เพิ่มระบบ
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
                <h3 className="font-bold text-brand-900">เพิ่มระบบประปาใหม่</h3>
                <p className="text-xs text-brand-500 mt-0.5">{villageName}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="village_id" value={villageId} />

              <div>
                <label className="label">ชื่อระบบประปา *</label>
                <input
                  name="system_name"
                  required
                  className="input"
                  placeholder="เช่น ระบบบ้านบน, ระบบวัด, ระบบโรงเรียน"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">ละติจูด (ถ้ามี)</label>
                  <input
                    name="lat"
                    type="number"
                    step="any"
                    className="input"
                    placeholder="19.xxxxx"
                  />
                </div>
                <div>
                  <label className="label">ลองจิจูด (ถ้ามี)</label>
                  <input
                    name="lng"
                    type="number"
                    step="any"
                    className="input"
                    placeholder="99.xxxxx"
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
                  สร้างและบันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}