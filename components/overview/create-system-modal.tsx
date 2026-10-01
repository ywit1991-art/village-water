'use client'

import { useActionState, useState, useEffect } from 'react'
import { createWaterSystemAction } from '@/app/admin/actions'
import { X, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useFocusTrap } from '@/components/ui/use-focus-trap'

interface Props {
  villageId: number
  villageName: string
}

export default function CreateSystemModal({ villageId, villageName }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [state, formAction] = useActionState(createWaterSystemAction, null)
  const modalRef = useFocusTrap<HTMLDivElement>(open, () => setOpen(false))

  useEffect(() => {
    if (state?.id) {
      toast.success('สร้างข้อมูลใหม่แล้ว 🎉')
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
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 font-medium text-sm active:scale-95 transition"
      >
        <Plus size={14} /> เพิ่มข้อมูล
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-system-title"
            tabIndex={-1}
            className="card w-full max-w-md p-6 outline-none"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3
                  id="create-system-title"
                  className="font-bold text-brand-900"
                >
                  เพิ่มข้อมูลประปาใหม่
                </h3>
                <p className="text-xs text-brand-500 mt-0.5">
                  {villageName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="ปิด"
                className="text-slate-400 hover:text-slate-600 active:scale-95 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="village_id" value={villageId} />

              <div>
                <label htmlFor="system_name" className="label">
                  ชื่อข้อมูลประปา *
                </label>
                <input
                  id="system_name"
                  name="system_name"
                  required
                  className="input"
                  placeholder="เช่น ข้อมูลบ้านบน, ข้อมูลวัด, ข้อมูลโรงเรียน"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="lat" className="label">
                    ละติจูด (ถ้ามี)
                  </label>
                  <input
                    id="lat"
                    name="lat"
                    type="number"
                    step="any"
                    className="input"
                    placeholder="19.xxxxx"
                  />
                </div>
                <div>
                  <label htmlFor="lng" className="label">
                    ลองจิจูด (ถ้ามี)
                  </label>
                  <input
                    id="lng"
                    name="lng"
                    type="number"
                    step="any"
                    className="input"
                    placeholder="99.xxxxx"
                  />
                </div>
              </div>

              {state?.error && (
                <p
                  role="alert"
                  className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3"
                >
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