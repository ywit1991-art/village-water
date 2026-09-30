'use client'

import { useState, useTransition } from 'react'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteStaffAction } from '../actions'

interface Props {
  staffId: number
  staffName: string
  staffCode: string
}

export default function DeleteStaffButton({ staffId, staffName, staffCode }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteStaffAction(staffId)
        toast.success('ลบเจ้าหน้าที่แล้ว')
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
        className="text-red-500 hover:text-red-700"
        title="ลบ"
      >
        <Trash2 size={14} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !isPending && setOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between p-5 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">ยืนยันการลบ</h3>
                  <p className="text-xs text-slate-500 mt-0.5">ไม่สามารถกู้คืนได้</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isPending && setOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500">เจ้าหน้าที่ที่จะลบ</p>
                <p className="font-semibold text-slate-900">{staffName}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{staffCode}</p>
              </div>
              <p className="text-sm text-slate-600">ต้องการลบเจ้าหน้าที่นี้ใช่หรือไม่?</p>
            </div>

            <div className="flex gap-2 p-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium text-sm hover:bg-white disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-sm shadow-md disabled:opacity-50"
              >
                {isPending ? 'กำลังลบ...' : 'ลบเจ้าหน้าที่'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}