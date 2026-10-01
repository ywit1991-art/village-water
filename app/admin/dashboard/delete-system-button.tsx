'use client'

import { useState, useTransition } from 'react'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteWaterSystemAction } from '../actions'

interface Props {
  systemId: number
  systemName: string
  villageName: string
  hasSurvey?: boolean
}

export default function DeleteSystemButton({
  systemId,
  systemName,
  villageName,
  hasSurvey = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteWaterSystemAction(systemId)
        toast.success('ลบข้อมูลแล้ว')
        setOpen(false)
        router.refresh()
      } catch (err) {
        console.error(err)
        toast.error('ลบไม่สำเร็จ')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-1 text-red-500 hover:text-red-700 font-medium text-xs active:scale-95 transition md:px-0 px-2 py-1.5 rounded-lg hover:bg-red-50"
        title="ลบข้อมูล"
        aria-label={`ลบ ${systemName}`}
      >
        <Trash2 size={18} className="md:w-3.5 md:h-3.5" />
        <span className="hidden md:inline">ลบ</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">ยืนยันการลบ</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    การลบไม่สามารถกู้คืนได้
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isPending && setOpen(false)}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
                disabled={isPending}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500">ข้อมูลที่จะลบ</p>
                <p className="font-semibold text-slate-900">{systemName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{villageName}</p>
              </div>

              {hasSurvey && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                  <p className="text-xs text-red-700 font-medium">
                    ⚠️ ข้อมูลนี้มีแบบสำรวจแล้ว
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    ข้อมูลแบบสำรวจและรูปภาพทั้งหมดจะถูกลบไปด้วย
                  </p>
                </div>
              )}

              <p className="text-sm text-slate-600">
                ต้องการลบข้อมูลนี้ใช่หรือไม่?
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 p-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium text-sm hover:bg-white transition disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
              >
                {isPending ? 'กำลังลบ...' : 'ลบข้อมูล'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}