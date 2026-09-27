'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { loginAction } from './actions'
import { AlertCircle } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full py-2.5"
    >
      {pending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
    </button>
  )
}

export default function AdminLogin() {
  const [state, formAction] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-50 to-white">
      <form action={formAction} className="card p-8 w-full max-w-md">
        {/* Header: โลโก้ + ข้อความ */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-brand-400/40 blur-xl scale-110" />
            <img
              src="/logo.png"
              alt="ตราเทศบาลตำบลท่าวังทอง"
              className="relative w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-2xl shadow-brand-500/50 ring-2 ring-brand-200"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-lg md:text-xl font-bold text-brand-900 leading-tight">
              เข้าสู่ระบบเจ้าหน้าที่
            </h1>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <input
              name="code"
              type="text"
              inputMode="numeric"
              maxLength={10}
              required
              pattern="[0-9]{10}"
              placeholder="XXXXXXXXXX"
              autoFocus
              aria-label="เลข 10 หลัก"
              className="input font-mono tracking-widest text-center text-lg"
            />
          </div>

          {state?.error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle size={16} />
              {state.error}
            </div>
          )}

          <SubmitButton />
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-brand-500 mt-6">
          <a href="/" className="hover:underline">
            ← กลับหน้าหลัก
          </a>
        </p>
      </form>
    </div>
  )
}